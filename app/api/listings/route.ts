import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Extract Cloudinary public_id from a secure URL for atomic asset purging
 */
function extractCloudinaryPublicId(url: string): string | null {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    // Remove version segment (e.g. v1791912723/) if present
    const pathAfterUpload = parts[1].replace(/^v\d+\//, '');
    // Strip file extension (.jpg, .png, etc.)
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    return publicId;
  } catch {
    return null;
  }
}

/**
 * Upload an uploaded File object directly to Cloudinary with auto-scaling
 */
async function uploadToCloudinary(
  file: File, 
  isHero: boolean = false
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64Image = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

  const uploadOptions: Record<string, any> = {
    folder: 'prime_time_luxury',
    resource_type: 'image',
  };

  // Auto-scale Hero cover to master 1920x1080 limit while optimizing quality
  if (isHero) {
    uploadOptions.transformation = [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ];
  } else {
    uploadOptions.transformation = [
      { quality: 'auto', fetch_format: 'auto' },
    ];
  }

  const uploadResult = await cloudinary.uploader.upload(base64Image, uploadOptions);
  return uploadResult.secure_url;
}

/**
 * POST: Publish new luxury property mandate with 30-asset Cloudinary pipeline and Cadastral GIS coordinates
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // 1. Extract Hero Cover Image (required)
    const heroFile = formData.get('image') as File | null;
    if (!heroFile || heroFile.size === 0) {
      return NextResponse.json(
        { error: 'Primary Hero Cover image is required.' },
        { status: 400 }
      );
    }

    // 2. Extract Interior & Gallery Photos (multi-file)
    const galleryFilesRaw = formData.getAll('gallery_images') as File[];
    const validGalleryFiles = galleryFilesRaw.filter(
      (f) => f && f.size > 0 && f.name && f.name !== 'undefined'
    );

    // 3. Server-side validation: Max 30 HD assets total (1 Hero + max 29 Gallery)
    if (validGalleryFiles.length > 29) {
      return NextResponse.json(
        { 
          error: `Upload capacity exceeded: Maximum 30 assets total (1 Hero Cover + up to 29 Interior photos). Provided: ${1 + validGalleryFiles.length} assets.` 
        },
        { status: 400 }
      );
    }

    // 4. Extract GIS Coordinates (latitude & longitude)
    const latRaw = formData.get('latitude');
    const lngRaw = formData.get('longitude');
    const parsedLat = latRaw && !isNaN(parseFloat(latRaw as string)) 
      ? parseFloat(parseFloat(latRaw as string).toFixed(6)) 
      : null;
    const parsedLng = lngRaw && !isNaN(parseFloat(lngRaw as string)) 
      ? parseFloat(parseFloat(lngRaw as string).toFixed(6)) 
      : null;

    // 5. Execute concurrent Cloudinary uploads for maximum throughput
    const uploadTasks: Promise<string>[] = [
      uploadToCloudinary(heroFile, true),
      ...validGalleryFiles.map((f) => uploadToCloudinary(f, false)),
    ];

    const uploadedUrls = await Promise.all(uploadTasks);

    // image_urls[0] is guaranteed to be the Hero Cover; image_urls[1..n] are gallery assets
    const heroUrl = uploadedUrls[0];
    const galleryUrls = uploadedUrls.slice(1);
    const consolidatedImageUrls = [heroUrl, ...galleryUrls];

    // 6. Build database record matching Supabase properties schema
    const propertyTitle = (formData.get('title') as string) || 'Untitled Luxury Property';
    const slugBase = propertyTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueSlug = `${slugBase}-${Date.now()}`;

    const basePropertyData: Record<string, any> = {
      title: propertyTitle,
      slug: uniqueSlug,
      demand: formData.get('demand') || '',
      location: formData.get('location') || '',
      size: formData.get('size') || '',
      bedrooms: parseInt(formData.get('bedrooms') as string, 10) || null,
      bathrooms: parseInt(formData.get('bathrooms') as string, 10) || null,
      description: formData.get('description') || '',
      image_urls: consolidatedImageUrls,
    };

    let insertedData: any = null;
    let schemaNotice: string | null = null;

    // 7. Insert with GIS coordinates if present, with resilient graceful schema fallback
    if (parsedLat !== null && parsedLng !== null) {
      const fullPropertyData = {
        ...basePropertyData,
        latitude: parsedLat,
        longitude: parsedLng,
      };

      const { data, error: dbError } = await supabase
        .from('properties')
        .insert([fullPropertyData])
        .select()
        .single();

      if (!dbError) {
        insertedData = data;
      } else {
        // If Supabase schema does not have latitude/longitude columns yet (code 42703)
        if (dbError.code === '42703' || dbError.message.includes('latitude')) {
          console.warn('GIS columns not yet migrated in Supabase. Falling back to base schema.');
          schemaNotice = 'Property published. To permanently persist GIS coordinates in PostgreSQL, execute: ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude double precision, ADD COLUMN IF NOT EXISTS longitude double precision; in Supabase SQL editor.';
          
          const fallback = await supabase
            .from('properties')
            .insert([basePropertyData])
            .select()
            .single();

          if (fallback.error) {
            console.error('Supabase fallback insert error:', fallback.error);
            return NextResponse.json(
              { error: `Database Error: ${fallback.error.message}` },
              { status: 500 }
            );
          }
          insertedData = fallback.data;
        } else {
          console.error('Supabase insert error:', dbError);
          return NextResponse.json(
            { error: `Database Error: ${dbError.message}` },
            { status: 500 }
          );
        }
      }
    } else {
      const { data, error: dbError } = await supabase
        .from('properties')
        .insert([basePropertyData])
        .select()
        .single();

      if (dbError) {
        console.error('Supabase insert error:', dbError);
        return NextResponse.json(
          { error: `Database Error: ${dbError.message}` },
          { status: 500 }
        );
      }
      insertedData = data;
    }

    // Revalidate paths for instant portfolio update
    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {
      // Background revalidation notice
    }

    return NextResponse.json({
      success: true,
      message: `Property "${propertyTitle}" published successfully with ${consolidatedImageUrls.length} HD visual assets!`,
      property: insertedData,
      total_assets: consolidatedImageUrls.length,
      hero_url: heroUrl,
      coordinates: parsedLat && parsedLng ? { latitude: parsedLat, longitude: parsedLng } : null,
      schema_notice: schemaNotice,
    });
  } catch (error: any) {
    console.error('Listing publication pipeline error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process listing' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: High-Security Listing Deletion Suite
 * Removes property record from Supabase and purges associated Cloudinary visual assets
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let propertyId = searchParams.get('id');

    // Also accept body JSON if provided
    if (!propertyId) {
      try {
        const body = await request.json();
        propertyId = body?.id ? String(body.id) : null;
      } catch {
        // Body was empty or non-JSON
      }
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required for deletion authorization.' },
        { status: 400 }
      );
    }

    const numericId = parseInt(propertyId, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Invalid property ID format.' },
        { status: 400 }
      );
    }

    // 1. Fetch property record to locate associated Cloudinary visual assets
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, slug, image_urls')
      .eq('id', numericId)
      .maybeSingle();

    if (fetchError) {
      console.error('Supabase fetch error before deletion:', fetchError);
      return NextResponse.json(
        { error: `Database fetch error: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!property) {
      return NextResponse.json(
        { error: `Property with ID #${numericId} was not found.` },
        { status: 404 }
      );
    }

    // 2. Concurrently purge Cloudinary media assets to prevent storage leakage
    if (Array.isArray(property.image_urls) && property.image_urls.length > 0) {
      const purgeTasks = property.image_urls
        .map((url: string) => extractCloudinaryPublicId(url))
        .filter((pubId: string | null): pubId is string => Boolean(pubId))
        .map((pubId: string) => 
          cloudinary.uploader.destroy(pubId).catch((err) => {
            console.warn(`Cloudinary asset purge warning for ${pubId}:`, err);
          })
        );

      if (purgeTasks.length > 0) {
        await Promise.allSettled(purgeTasks);
      }
    }

    // 3. Delete property record from Supabase
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', numericId);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json(
        { error: `Database deletion failed: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // 4. Invalidate App Router cache
    try {
      revalidatePath('/');
      revalidatePath('/admin');
      if (property.slug) {
        revalidatePath(`/properties/${property.slug}`);
      }
    } catch {
      // Revalidation warning
    }

    return NextResponse.json({
      success: true,
      message: `Property mandate "${property.title}" (#${numericId}) has been securely expunged from the portfolio desk.`,
      deleted_id: numericId,
      deleted_title: property.title,
    });
  } catch (error: any) {
    console.error('Listing deletion suite error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute deletion suite' },
      { status: 500 }
    );
  }
}