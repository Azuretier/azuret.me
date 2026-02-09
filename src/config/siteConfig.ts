/**
 * Site Configuration
 * Edit this file to customize the content displayed on the homepage.
 */

/* ── Site Identity ─────────────────────────────────────────── */

export const siteIdentity = {
    name: 'azuret.me',
    logoAccent: 'azuret',
    logoSuffix: '.me',
    copyright: 'azuret.me',
    madeWith: '<3',
}

/* ── Hero Section ──────────────────────────────────────────── */

export const hero = {
    title: 'azuret.me',
    subtitle: 'Developer, creator, and cat-person based in Kanagawa.',
    description: 'Building things with code, creativity, and connection.',
    japanese: '前世は子猫です。目標くらい高く持ってもいいでしょ？ ^. ̫ .^',
    avatarAlt: 'Profile',
}

/* ── Navigation Links ──────────────────────────────────────── */

export const navLinks = [
    { label: 'Home', href: '/', active: true },
    { label: 'Profiles', href: '/profiles' },
    { label: 'Links', href: '/links' },
]

/* ── About Me Cards ────────────────────────────────────────── */

export const aboutItems = [
    {
        label: 'Location',
        value: 'Kanagawa, Japan',
        color: '#1d9bf0',
    },
    {
        label: 'Interests',
        value: 'Programming, Music, Talking with people',
        color: '#a78bfa',
    },
    {
        label: 'Goal',
        value: 'Visit the Himalayas and Thailand',
        color: '#10b981',
    },
    {
        label: 'Stack',
        value: 'TypeScript, React, Next.js, Three.js',
        color: '#f59e0b',
    },
]

/* ── Comment Wall ──────────────────────────────────────────── */

export const commentWall = {
    sectionTitle: 'Wall',
    messagesLabel: 'messages',
    namePlaceholder: 'Your name',
    messagePlaceholder: 'Leave a message on the wall...',
    sendButton: 'Send',
    sendingButton: 'Sending...',
    emptyMessage: 'No messages yet. Be the first to say hello!',
}

/* ── Profile Banner ────────────────────────────────────────── */

export const profileBanner = {
    title: 'Community Profiles',
    subtitle: 'Create your profile at azuret.me and join the community',
    href: '/profiles',
}

/* ── Footer Links ──────────────────────────────────────────── */

export const footerLinks = {
    resources: {
        heading: 'Resources',
        links: [
            { label: 'azuretier.net', href: 'https://azuretier.net', external: true },
            { label: 'GitHub', href: 'https://github.com/Azuretier', external: true },
        ],
    },
    social: {
        heading: 'Social',
        links: [
            { label: 'X (Twitter)', href: 'https://x.com/c2c546', external: true },
            { label: 'Discord', href: 'https://discord.gg/2Q4Cw8fcrv', external: true },
        ],
    },
    site: {
        heading: 'Site',
        links: [
            { label: 'Home', href: '/' },
            { label: 'Profiles', href: '/profiles' },
            { label: 'Links', href: '/links' },
        ],
    },
}

/* ── Social Links (Links Page) ─────────────────────────────── */

export const socialLinks = [
    {
        id: 'x',
        name: 'X (Twitter)',
        handle: '@c2c546',
        description: 'Thoughts, updates, and daily musings.',
        href: 'https://x.com/c2c546',
        color: '#1d9bf0',
    },
    {
        id: 'github',
        name: 'GitHub',
        handle: '@Azuretier',
        description: 'Open-source projects and contributions.',
        href: 'https://github.com/Azuretier',
        color: '#8b5cf6',
    },
    {
        id: 'discord',
        name: 'Discord',
        handle: 'Community Server',
        description: 'Join the community and chat in real-time.',
        href: 'https://discord.gg/2Q4Cw8fcrv',
        color: '#5865f2',
    },
    {
        id: 'website',
        name: 'azuretier.net',
        handle: 'Game Website',
        description: 'The main hub for all things Azuretier.',
        href: 'https://azuretier.net',
        color: '#10b981',
    },
]

/* ── Links Page ────────────────────────────────────────────── */

export const linksPage = {
    title: 'Connect with me',
    subtitle: 'Find me across the internet.',
    avatarLetter: 'A',
    visitButton: 'Visit',
}

/* ── Media Slideshow ───────────────────────────────────────── */

export const mediaFiles = [
    '/media/1.png',
    '/media/2.jpg',
    '/media/3.jpg',
    '/media/4.jpg',
    '/media/5.jfif',
    '/media/6.png',
    '/media/7.jpg',
    '/media/8.jpg',
]

export const slideshowInterval = 1000 // milliseconds
