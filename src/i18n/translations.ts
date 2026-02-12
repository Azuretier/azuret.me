export type Locale = 'en' | 'ja' | 'th' | 'es'

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
  th: 'ไทย',
  es: 'Español',
}

export const locales: Locale[] = ['en', 'ja', 'th', 'es']

export interface Translations {
  /* ── nav ─────────────────────────────────────────────────── */
  nav: {
    home: string
    profiles: string
    links: string
  }

  /* ── hero ────────────────────────────────────────────────── */
  hero: {
    subtitle: string
    description: string
  }

  /* ── about cards ─────────────────────────────────────────── */
  about: {
    location: string
    locationValue: string
    interests: string
    interestsValue: string
    goal: string
    goalValue: string
    stack: string
    stackValue: string
  }

  /* ── comment wall ────────────────────────────────────────── */
  commentWall: {
    sectionTitle: string
    messagesLabel: string
    namePlaceholder: string
    messagePlaceholder: string
    sendButton: string
    sendingButton: string
    emptyMessage: string
  }

  /* ── profile banner ──────────────────────────────────────── */
  profileBanner: {
    title: string
    subtitle: string
  }

  /* ── footer ──────────────────────────────────────────────── */
  footer: {
    resources: string
    social: string
    site: string
    madeWith: string
  }

  /* ── links page ──────────────────────────────────────────── */
  linksPage: {
    title: string
    subtitle: string
    visitButton: string
    xDescription: string
    githubDescription: string
    discordDescription: string
    websiteDescription: string
  }

  /* ── profiles page ───────────────────────────────────────── */
  profilesPage: {
    heroTitle: string
    heroSub: string
    createTitle: string
    yourDetails: string
    formSub: string
    usernameLabel: string
    usernamePlaceholder: string
    displayNameLabel: string
    displayNamePlaceholder: string
    bioLabel: string
    bioPlaceholder: string
    websiteLabel: string
    websitePlaceholder: string
    createButton: string
    creatingButton: string
    successMessage: string
    networkError: string
    membersTitle: string
    profilesCount: string
    emptyProfiles: string
    joinedPrefix: string
  }

  /* ── advancement widget ──────────────────────────────────── */
  widget: {
    communityProgress: string
    level: string
    toNextLevel: string
    messages: string
    likes: string
    members: string
  }
}

const en: Translations = {
  nav: {
    home: 'Home',
    profiles: 'Profiles',
    links: 'Links',
  },
  hero: {
    subtitle: 'Developer, creator, and cat-person based in Kanagawa.',
    description: 'Building things with code, creativity, and connection.',
  },
  about: {
    location: 'Location',
    locationValue: 'Kanagawa, Japan',
    interests: 'Interests',
    interestsValue: 'Programming, Music, Talking with people',
    goal: 'Goal',
    goalValue: 'Visit the Himalayas and Thailand',
    stack: 'Stack',
    stackValue: 'TypeScript, React, Next.js, Three.js',
  },
  commentWall: {
    sectionTitle: 'Wall',
    messagesLabel: 'messages',
    namePlaceholder: 'Your name',
    messagePlaceholder: 'Leave a message on the wall...',
    sendButton: 'Send',
    sendingButton: 'Sending...',
    emptyMessage: 'No messages yet. Be the first to say hello!',
  },
  profileBanner: {
    title: 'Community Profiles',
    subtitle: 'Create your profile at azuret.me and join the community',
  },
  footer: {
    resources: 'Resources',
    social: 'Social',
    site: 'Site',
    madeWith: 'made with',
  },
  linksPage: {
    title: 'Connect with me',
    subtitle: 'Find me across the internet.',
    visitButton: 'Visit',
    xDescription: 'Thoughts, updates, and daily musings.',
    githubDescription: 'Open-source projects and contributions.',
    discordDescription: 'Join the community and chat in real-time.',
    websiteDescription: 'The main hub for all things Azuretier.',
  },
  profilesPage: {
    heroTitle: 'Community Profiles',
    heroSub: 'Leave your mark, share who you are.',
    createTitle: 'Create Profile',
    yourDetails: 'Your Details',
    formSub: 'Fill in the fields below to create your profile on azuret.me',
    usernameLabel: 'Username',
    usernamePlaceholder: 'coolperson',
    displayNameLabel: 'Display Name',
    displayNamePlaceholder: 'Cool Person',
    bioLabel: 'Bio',
    bioPlaceholder: 'A short bio about yourself...',
    websiteLabel: 'Website (optional)',
    websitePlaceholder: 'https://yoursite.com',
    createButton: 'Create Profile',
    creatingButton: 'Creating...',
    successMessage: 'Profile created!',
    networkError: 'Network error, please try again',
    membersTitle: 'Members',
    profilesCount: 'profiles',
    emptyProfiles: 'No profiles yet. Be the first to join!',
    joinedPrefix: 'Joined',
  },
  widget: {
    communityProgress: 'Community Progress',
    level: 'Level',
    toNextLevel: 'to next level',
    messages: 'Messages',
    likes: 'Likes',
    members: 'Members',
  },
}

const ja: Translations = {
  nav: {
    home: 'ホーム',
    profiles: 'プロフィール',
    links: 'リンク',
  },
  hero: {
    subtitle: '神奈川在住のデベロッパー、クリエイター、猫好き。',
    description: 'コード、創造性、つながりで何かを作る。',
  },
  about: {
    location: '所在地',
    locationValue: '神奈川県、日本',
    interests: '興味',
    interestsValue: 'プログラミング、音楽、人と話すこと',
    goal: '目標',
    goalValue: 'ヒマラヤとタイを訪れる',
    stack: '技術スタック',
    stackValue: 'TypeScript, React, Next.js, Three.js',
  },
  commentWall: {
    sectionTitle: 'ウォール',
    messagesLabel: 'メッセージ',
    namePlaceholder: 'あなたの名前',
    messagePlaceholder: 'ウォールにメッセージを残す...',
    sendButton: '送信',
    sendingButton: '送信中...',
    emptyMessage: 'まだメッセージがありません。最初に挨拶しよう！',
  },
  profileBanner: {
    title: 'コミュニティプロフィール',
    subtitle: 'azuret.meでプロフィールを作成してコミュニティに参加しよう',
  },
  footer: {
    resources: 'リソース',
    social: 'ソーシャル',
    site: 'サイト',
    madeWith: 'made with',
  },
  linksPage: {
    title: 'つながろう',
    subtitle: 'インターネット上で見つけてください。',
    visitButton: '訪問',
    xDescription: '日々の考え、アップデート、つぶやき。',
    githubDescription: 'オープンソースプロジェクトと貢献。',
    discordDescription: 'コミュニティに参加してリアルタイムでチャット。',
    websiteDescription: 'Azuretierのすべてが集まるメインハブ。',
  },
  profilesPage: {
    heroTitle: 'コミュニティプロフィール',
    heroSub: 'あなたの足跡を残し、自分を共有しよう。',
    createTitle: 'プロフィール作成',
    yourDetails: 'あなたの情報',
    formSub: '以下のフィールドを入力してazuret.meにプロフィールを作成',
    usernameLabel: 'ユーザー名',
    usernamePlaceholder: 'coolperson',
    displayNameLabel: '表示名',
    displayNamePlaceholder: 'Cool Person',
    bioLabel: '自己紹介',
    bioPlaceholder: '短い自己紹介を書いてください...',
    websiteLabel: 'ウェブサイト（任意）',
    websitePlaceholder: 'https://yoursite.com',
    createButton: 'プロフィール作成',
    creatingButton: '作成中...',
    successMessage: 'プロフィールを作成しました！',
    networkError: 'ネットワークエラー、もう一度お試しください',
    membersTitle: 'メンバー',
    profilesCount: 'プロフィール',
    emptyProfiles: 'まだプロフィールがありません。最初に参加しよう！',
    joinedPrefix: '参加日',
  },
  widget: {
    communityProgress: 'コミュニティの進捗',
    level: 'レベル',
    toNextLevel: '次のレベルまで',
    messages: 'メッセージ',
    likes: 'いいね',
    members: 'メンバー',
  },
}

const th: Translations = {
  nav: {
    home: 'หน้าแรก',
    profiles: 'โปรไฟล์',
    links: 'ลิงก์',
  },
  hero: {
    subtitle: 'นักพัฒนา ครีเอเตอร์ และคนรักแมวจากคานากาวะ',
    description: 'สร้างสรรค์สิ่งต่าง ๆ ด้วยโค้ด ความคิดสร้างสรรค์ และการเชื่อมต่อ',
  },
  about: {
    location: 'ที่ตั้ง',
    locationValue: 'คานากาวะ ประเทศญี่ปุ่น',
    interests: 'ความสนใจ',
    interestsValue: 'การเขียนโปรแกรม ดนตรี พูดคุยกับผู้คน',
    goal: 'เป้าหมาย',
    goalValue: 'ไปเที่ยวเทือกเขาหิมาลัยและประเทศไทย',
    stack: 'เทคโนโลยี',
    stackValue: 'TypeScript, React, Next.js, Three.js',
  },
  commentWall: {
    sectionTitle: 'กำแพงข้อความ',
    messagesLabel: 'ข้อความ',
    namePlaceholder: 'ชื่อของคุณ',
    messagePlaceholder: 'เขียนข้อความบนกำแพง...',
    sendButton: 'ส่ง',
    sendingButton: 'กำลังส่ง...',
    emptyMessage: 'ยังไม่มีข้อความ เป็นคนแรกที่ทักทาย!',
  },
  profileBanner: {
    title: 'โปรไฟล์ชุมชน',
    subtitle: 'สร้างโปรไฟล์ของคุณที่ azuret.me และเข้าร่วมชุมชน',
  },
  footer: {
    resources: 'แหล่งข้อมูล',
    social: 'โซเชียล',
    site: 'เว็บไซต์',
    madeWith: 'สร้างด้วย',
  },
  linksPage: {
    title: 'ติดต่อฉัน',
    subtitle: 'พบฉันได้ทั่วอินเทอร์เน็ต',
    visitButton: 'เยี่ยมชม',
    xDescription: 'ความคิด อัปเดต และเรื่องราวประจำวัน',
    githubDescription: 'โปรเจกต์โอเพนซอร์สและการมีส่วนร่วม',
    discordDescription: 'เข้าร่วมชุมชนและสนทนาแบบเรียลไทม์',
    websiteDescription: 'ศูนย์กลางของทุกสิ่งเกี่ยวกับ Azuretier',
  },
  profilesPage: {
    heroTitle: 'โปรไฟล์ชุมชน',
    heroSub: 'ทิ้งร่องรอยของคุณ แบ่งปันตัวตนของคุณ',
    createTitle: 'สร้างโปรไฟล์',
    yourDetails: 'รายละเอียดของคุณ',
    formSub: 'กรอกข้อมูลด้านล่างเพื่อสร้างโปรไฟล์ของคุณบน azuret.me',
    usernameLabel: 'ชื่อผู้ใช้',
    usernamePlaceholder: 'coolperson',
    displayNameLabel: 'ชื่อที่แสดง',
    displayNamePlaceholder: 'Cool Person',
    bioLabel: 'ประวัติ',
    bioPlaceholder: 'เขียนประวัติสั้น ๆ เกี่ยวกับตัวคุณ...',
    websiteLabel: 'เว็บไซต์ (ไม่บังคับ)',
    websitePlaceholder: 'https://yoursite.com',
    createButton: 'สร้างโปรไฟล์',
    creatingButton: 'กำลังสร้าง...',
    successMessage: 'สร้างโปรไฟล์สำเร็จ!',
    networkError: 'เกิดข้อผิดพลาดเครือข่าย กรุณาลองอีกครั้ง',
    membersTitle: 'สมาชิก',
    profilesCount: 'โปรไฟล์',
    emptyProfiles: 'ยังไม่มีโปรไฟล์ เป็นคนแรกที่เข้าร่วม!',
    joinedPrefix: 'เข้าร่วม',
  },
  widget: {
    communityProgress: 'ความคืบหน้าชุมชน',
    level: 'ระดับ',
    toNextLevel: 'สู่ระดับถัดไป',
    messages: 'ข้อความ',
    likes: 'ถูกใจ',
    members: 'สมาชิก',
  },
}

const es: Translations = {
  nav: {
    home: 'Inicio',
    profiles: 'Perfiles',
    links: 'Enlaces',
  },
  hero: {
    subtitle: 'Desarrollador, creador y amante de los gatos en Kanagawa.',
    description: 'Construyendo cosas con codigo, creatividad y conexion.',
  },
  about: {
    location: 'Ubicacion',
    locationValue: 'Kanagawa, Japon',
    interests: 'Intereses',
    interestsValue: 'Programacion, Musica, Hablar con gente',
    goal: 'Meta',
    goalValue: 'Visitar el Himalaya y Tailandia',
    stack: 'Stack',
    stackValue: 'TypeScript, React, Next.js, Three.js',
  },
  commentWall: {
    sectionTitle: 'Muro',
    messagesLabel: 'mensajes',
    namePlaceholder: 'Tu nombre',
    messagePlaceholder: 'Deja un mensaje en el muro...',
    sendButton: 'Enviar',
    sendingButton: 'Enviando...',
    emptyMessage: 'No hay mensajes aun. Se el primero en saludar!',
  },
  profileBanner: {
    title: 'Perfiles de la Comunidad',
    subtitle: 'Crea tu perfil en azuret.me y unete a la comunidad',
  },
  footer: {
    resources: 'Recursos',
    social: 'Social',
    site: 'Sitio',
    madeWith: 'hecho con',
  },
  linksPage: {
    title: 'Conecta conmigo',
    subtitle: 'Encuentrame en internet.',
    visitButton: 'Visitar',
    xDescription: 'Pensamientos, novedades y reflexiones diarias.',
    githubDescription: 'Proyectos de codigo abierto y contribuciones.',
    discordDescription: 'Unete a la comunidad y chatea en tiempo real.',
    websiteDescription: 'El centro principal de todo lo de Azuretier.',
  },
  profilesPage: {
    heroTitle: 'Perfiles de la Comunidad',
    heroSub: 'Deja tu huella, comparte quien eres.',
    createTitle: 'Crear Perfil',
    yourDetails: 'Tus Datos',
    formSub: 'Completa los campos para crear tu perfil en azuret.me',
    usernameLabel: 'Usuario',
    usernamePlaceholder: 'coolperson',
    displayNameLabel: 'Nombre',
    displayNamePlaceholder: 'Cool Person',
    bioLabel: 'Bio',
    bioPlaceholder: 'Una breve biografia sobre ti...',
    websiteLabel: 'Sitio web (opcional)',
    websitePlaceholder: 'https://tusitio.com',
    createButton: 'Crear Perfil',
    creatingButton: 'Creando...',
    successMessage: 'Perfil creado!',
    networkError: 'Error de red, intentalo de nuevo',
    membersTitle: 'Miembros',
    profilesCount: 'perfiles',
    emptyProfiles: 'No hay perfiles aun. Se el primero en unirte!',
    joinedPrefix: 'Se unio el',
  },
  widget: {
    communityProgress: 'Progreso de la Comunidad',
    level: 'Nivel',
    toNextLevel: 'para el siguiente nivel',
    messages: 'Mensajes',
    likes: 'Me gusta',
    members: 'Miembros',
  },
}

export const translations: Record<Locale, Translations> = { en, ja, th, es }
