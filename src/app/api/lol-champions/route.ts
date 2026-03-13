import { NextResponse } from 'next/server'

const DD_VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'

export async function GET() {
    try {
        // Get latest DD version
        const vRes = await fetch(DD_VERSIONS_URL, { next: { revalidate: 1800 } })
        if (!vRes.ok) {
            return NextResponse.json(
                { error: `Version fetch failed: ${vRes.status}` },
                { status: vRes.status }
            )
        }
        const versions = await vRes.json()
        const latest = versions[0]

        // Fetch champion data for that version
        const champUrl = `https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/championFull.json`
        const res = await fetch(champUrl, { next: { revalidate: 1800 } })
        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream error: ${res.status} ${res.statusText}` },
                { status: res.status }
            )
        }
        const data = await res.json()
        return NextResponse.json({ version: latest, champions: data.data })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 502 })
    }
}
