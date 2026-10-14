import { NextResponse } from 'next/server';
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

    // 4. Execute concurrent Cloudinary uploads for maximum throughput
    // Hero cover uses master 1920x1080 scaling; interior photos use auto quality/format
    const uploadTasks: Promise<string>[] = [
      uploadToCloudinary(heroFile, true),
      ...validGalleryFiles.map((f) => uploadToCloudinary(f, false)),
    ];

    const uploadedUrls = await Promise.all(uploadTasks);

    // image_urls[0] is guaranteed to be the Hero Cover; image_urls[1..n] are gallery assets
    const heroUrl = uploadedUrls[0];
    const galleryUrls = uploadedUrls.slice(1);
    const consolidatedImageUrls = [heroUrl, ...galleryUrls];

    // 5. Build database record matching Supabase properties schema
    const propertyTitle = (formData.get('title') as string) || 'Untitled Luxury Property';
    const slugBase = propertyTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueSlug = `${slugBase}-${Date.now()}`;

    const propertyData = {
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

    // 6. Insert into Supabase properties table
    const { data: insertedData, error: dbError } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json(
        { error: `Database Error: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Property "${propertyTitle}" published successfully with ${consolidatedImageUrls.length} HD visual assets!`,
      property: insertedData,
      total_assets: consolidatedImageUrls.length,
      hero_url: heroUrl,
    });
  } catch (error: any) {
    console.error('Listing publication pipeline error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process listing' },
      { status: 500 }
    );
  }
}