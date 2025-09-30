import { NextRequest } from 'next/server';
import { calculateRating } from '@/lib/ratingUtils';
import { ImageResponse } from '@vercel/og';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import React from 'react';
const best30 = {};
const new20 = {};
export async function GET(req: NextRequest) {
  
}
