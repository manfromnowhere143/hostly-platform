/**
 * iCAL EXPORT ENDPOINT
 *
 * Industry-standard calendar sync format supported by ALL major OTAs:
 * - Airbnb
 * - Booking.com
 * - VRBO
 * - Expedia
 * - Google Calendar
 *
 * URL Format: /api/public/{org}/properties/{propertySlug}/calendar.ics
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'

function formatICalDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; propertySlug: string }> }
) {
  try {
    const { org, propertySlug } = await params

    const organization = await prisma.organization.findUnique({
      where: { slug: org },
    })

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 })
    }

    const property = await prisma.property.findFirst({
      where: {
        organizationId: organization.id,
        slug: propertySlug,
      },
    })

    if (!property) {
      return new NextResponse('Property not found', { status: 404 })
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        propertyId: property.id,
        status: { in: ['confirmed', 'pending'] },
      },
      include: { guest: true },
      orderBy: { checkIn: 'asc' },
    })

    const domain = process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, '') || 'hostly.app'
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hostly//Property Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${escapeICalText(property.name)}`,
    ]

    for (const res of reservations) {
      const guestName = res.guest
        ? `${res.guest.firstName} ${res.guest.lastName}`.trim()
        : 'Guest'

      lines.push(
        'BEGIN:VEVENT',
        `UID:${res.id}@${domain}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART;VALUE=DATE:${formatICalDate(res.checkIn)}`,
        `DTEND;VALUE=DATE:${formatICalDate(res.checkOut)}`,
        `SUMMARY:Reserved - ${escapeICalText(guestName)}`,
        `DESCRIPTION:Confirmation: ${res.confirmationCode}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      )
    }

    lines.push('END:VCALENDAR')

    return new NextResponse(lines.join('\r\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${propertySlug}-calendar.ics"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('[iCal Export] Error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
