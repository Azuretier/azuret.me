import { NextResponse } from 'next/server'

const MERAKI_URL = 'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json'

export async function GET() {
    try {
        const res = await fetch(MERAKI_URL, { next: { revalidate: 3600 } })
        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream error: ${res.status} ${res.statusText}` },
                { status: res.status }
            )
        }
        const data = await res.json()
        return NextResponse.json(data)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 502 })
    }
}
