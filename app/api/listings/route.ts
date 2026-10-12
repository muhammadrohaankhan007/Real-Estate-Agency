import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No high-res image provided." }, { status: 400 });
    }

    // Convert the image file to a Node Buffer for Cloudinary processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Stream the buffer directly to Cloudinary
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "prime_time_luxury" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result?.secure_url as string);
        }
      );
      uploadStream.end(buffer);
    });

    // Package the raw form data for the Supabase SQL database
    const propertyTitle = formData.get('title') as string;
    const propertyData = {
      title: propertyTitle,
      slug: propertyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'), // Generates URL-friendly slug
      demand: formData.get('demand'),
      location: formData.get('location'),
      size: formData.get('size'),
      bedrooms: parseInt(formData.get('bedrooms') as string) || null,
      bathrooms: parseInt(formData.get('bathrooms') as string) || null,
      description: formData.get('description'),
      image_urls: [imageUrl], // Array format as defined in our SQL schema
    };

    // Push the compiled data to Supabase
    const { error: dbError } = await supabase
      .from('properties')
      .insert([propertyData]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, message: "Property securely published." });

  } catch (error) {
    console.error("Backend pipeline error:", error);
    return NextResponse.json({ error: "Failed to process the listing." }, { status: 500 });
  }
}
