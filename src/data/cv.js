export const siteConfig = {
  web3FormsKey: '',
  booking: '',
};

export const profile = {
  name: 'Renzo Emiliano Carletti',
  firstName: 'Renzo',
  role: 'Decoupled Drupal & React Engineer',
  roles: [
    'Decoupled Drupal & React Engineer',
    'Headless CMS Architect',
    'REST & GraphQL API Specialist',
    'Developer with a DevOps mindset',
  ],
  location: 'Paraná, Entre Ríos, AR',
  email: 'renzocarletti@hotmail.com',
  phone: '+54 9 343 4295 881',
  linkedin: 'https://www.linkedin.com/in/renzo-emiliano-carletti-7bbaba20b/',
  github: 'https://github.com/Pipoku',
  summary:
    'Senior Full-Stack Developer with over 5 years of experience building high-performance web applications and modernizing legacy systems. I specialize in headless CMS architectures that integrate Drupal with React and Vue.js, and in building solid REST and GraphQL APIs. I put a lot of focus on requirement analysis to turn complex business needs into scalable architectures, with a proven record of cutting infrastructure costs, optimizing backend performance and keeping multi-environment deployments stable. I also bridge the gap between technical and non-technical stakeholders.',
  highlights: [
    '5+ years building high-performance web apps',
    'Led Drupal-to-headless CMS transformation',
    '30% faster load times, 40% lower infra costs',
    '57,000+ active users on university portals',
  ],
};

export const stats = [
  { value: 30, suffix: '%', id: 'load', label: 'load time reduction' },
  { value: 40, suffix: '%', id: 'infra', label: 'infrastructure costs cut' },
  { value: 57, suffix: 'K+', id: 'users', label: 'active users supported' },
  { value: 786, suffix: 'K+', id: 'events', label: 'events processed' },
  { value: 80, suffix: '%', id: 'auto', label: 'manual tasks automated' },
  { value: 5, suffix: '+', id: 'years', label: 'years of experience' },
];

export const projects = [
  {
    name: 'e-UADER',
    url: 'https://e.uader.edu.ar/',
    role: 'full',
    tagline: 'UADER e-learning platform',
    desc: 'Online learning portal: course and diploma catalog, 5-step self-enrollment, Drupal Commerce + Moodle REST integration and automatic digital certification (state or university).',
    tech: ['Drupal', 'Moodle', 'REST APIs', 'Commerce'],
    metric: '1,100+ enrollments in its first month',
    featured: true,
    case: {
      problem: 'There was no unified enrollment path across platforms. Processes were manual, faculty by faculty, and digital certification was slow.',
      solution: 'Architected Drupal Commerce + Moodle REST integration with a 5-step self-enrollment flow and automated digital certification.',
      impact: '1,100+ enrollments in the first month and certificates issued automatically, cutting admin work and time-to-enroll.',
    },
  },
  {
    name: 'Ingresantes UADER',
    url: 'https://ingresantes.uader.edu.ar/',
    role: 'full',
    tagline: 'First door for future students',
    desc: 'Prospective-student portal: career finder across 4 faculties and 16 localities, pre-inscription workflows, orientation tools and downloadable academic offers.',
    tech: ['Drupal', 'Paragraphs', 'Views'],
    metric: '4 faculties · 16 localities',
    featured: true,
    case: {
      problem: 'Future students had no single place to discover careers across 4 faculties and 16 localities or pre-enroll online.',
      solution: 'Built a career finder with pre-inscription workflows, orientation tools and downloadable academic offers on Drupal.',
      impact: 'A clear, guided first step for every applicant. Less friction and fewer support tickets during inscription season.',
    },
  },
  {
    name: 'Buenos Aires Ciudad',
    url: 'https://buenosaires.gob.ar/inicio/',
    role: 'consultant',
    tagline: 'City government portal',
    desc: 'Drupal 8 → 10 migration for the City of Buenos Aires: content remodeling, Paragraphs, bug fixing and ongoing support as Drupal consultant via CyS.',
    tech: ['Drupal 8→10', 'Paragraphs'],
    metric: null,
    featured: false,
    case: {
      problem: 'Drupal 8 codebase with content sprawl, unstable upgrades and a migration to Drupal 10 ahead.',
      solution: 'Led the Drupal 8 → 10 migration with content remodeling and Paragraphs, plus ongoing consulting support.',
      impact: 'A stable, modern editorial platform for one of the largest city governments in the region.',
    },
  },
  {
    name: 'Club San Jorge',
    url: 'https://clubsanjorge.com.ar/',
    role: 'modernization',
    tagline: 'Legacy modernization',
    desc: 'Refined a legacy project with little standardization: applied modern patterns, cleaner structure and maintainable practices.',
    tech: ['PHP', 'Legacy → Modern'],
    metric: null,
    featured: false,
    case: {
      problem: 'A legacy codebase with little standardization. High maintenance cost and hard to extend safely.',
      solution: 'Refactored the project applying modern patterns, cleaner structure and maintainable practices.',
      impact: 'A codebase the client can extend with confidence and lower ongoing maintenance cost.',
    },
  },
];

export const experience = [
  {
    company: 'CyS Informática',
    role: 'Specialized Drupal Consultant',
    period: '03/2026 · 04/2026',
    meta: 'Remote · Contract',
    bullets: [
      'Contributed to the modernization and maintenance of corporate platforms, executing critical migrations, secure content management and stable multi-environment releases.',
      'Executed comprehensive content adaptation during a Drupal 8 to Drupal 10 migration, resolving synchronization conflicts and implementing code requirements across both versions.',
      'Led the resolution of high-priority critical incidents, ensuring operational continuity through emergency support. Owned complex system blockers that escalated beyond the original team, securing platform uptime.',
      'Architected and stabilized Drupal 10 content governance with role-based access control (RBAC), aligning business rules across dev, staging and production.',
      'Engineered JSON:API integrations and complex publishing workflows to secure unpublished content and improve data integrity.',
      'Resolved configuration drift and dependency conflicts by standardizing environment management with Composer, DDEV and Drush.',
      'Audited and refactored custom and contributed Drupal modules, significantly reducing technical debt.',
    ],
  },
  {
    company: 'Activarte',
    role: 'Full-Stack Developer (Drupal + React)',
    period: '2023 · 2026',
    meta: 'Remote',
    bullets: [
      'Architected a Drupal to headless CMS transformation using React, REST APIs and OAuth2, delivering a secure, scalable full-stack application.',
      'Led the transformation of a monolithic CMS into a high-performance headless architecture. Result: 30% faster load times and 40% lower infrastructure costs.',
      'Developed and optimized high-frequency REST endpoints and secure OAuth2 flows for robust data security and efficient front and back-end communication.',
      'Built dynamic, performant UIs by creating custom React components that consume complex JSON:API payloads.',
      'Accelerated delivery managing Agile sprints in Jira and collaborating via cross-functional code reviews on Bitbucket.',
      'Provided technical guidance and mentorship to team members, keeping code quality high across the development lifecycle.',
    ],
  },
  {
    company: 'UADER Rectorado',
    role: 'Drupal / Moodle Developer',
    period: '2021 · Present',
    meta: 'Part-time · In-office',
    bullets: [
      'Direct university web projects with Drupal and Moodle REST APIs, improving student services and streamlining administrative workflows. I act as the main link between academic, administrative and government stakeholders, turning requirements into technical solutions.',
      'Leading the migration of a legacy monolithic Drupal project to a high-performance headless architecture with React and GraphQL, optimizing data querying and transfer.',
      'Directing the end-to-end development of a new internal university project from scratch with Vue.js, building modern, interactive and scalable interfaces.',
      'Directed end-to-end development of three mission-critical university portals, scaling infrastructure for 57,000+ active users and 786,000+ events with high availability and optimal load times.',
      'Automated high-volume admin workflows with ECA and custom Drupal modules, reducing manual tasks by 80% and minimizing human error.',
      'Stabilized core infrastructure, fixing recurring bottlenecks and cutting downtime by 25% through proactive debugging and server optimization.',
      'Built and launched an automated course subscription platform on Moodle REST APIs, processing 1,100+ new enrollments in its first month.',
      'Lead technical mentorship and training, guiding the team on Drupal best practices and project lifecycle management.',
      'Architecting a custom multi-agent AI orchestrator that automates software development lifecycles, assigning specialized roles to LLMs to optimize code generation, review and deployment.',
    ],
  },
];

export const skills = [
  {
    group: 'Languages & Frameworks',
    items: ['React.js', 'Vue.js', 'PHP', 'JavaScript (ES6+)', 'Java', 'Symfony', 'jQuery', 'Bootstrap', 'Sass', 'HTML5', 'CSS3', 'SQL'],
  },
  {
    group: 'CMS & Ecosystem',
    items: ['Drupal 9/10/11', 'Theming', 'Custom Modules', 'Hooks', 'Entity API', 'Configuration Management', 'Commerce', 'ECA', 'Moodle'],
  },
  {
    group: 'Web Dev & Performance',
    items: ['RESTful APIs', 'GraphQL', 'JSON:API', 'OAuth2', 'Web Optimization', 'Debugging (Xdebug, Chrome DevTools)'],
  },
  {
    group: 'Databases & Tools',
    items: ['MySQL', 'PostgreSQL', 'CI/CD', 'Pantheon', 'Composer', 'DDEV', 'Drush', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VPN', 'SSH', 'Docker', 'Kubernetes', 'AWS'],
  },
  {
    group: 'Security & Methodologies',
    items: ['OWASP Principles', 'Secure Authentication', 'Agile (Scrum, Kanban)', 'Jira'],
  },
  {
    group: 'AI & Development Workflows',
    items: ['Multi-Agent System Orchestration', 'AI-assisted Workflows (Cursor, Ollama / Local LLMs)', 'Prompt Engineering'],
  },
];

export const certifications = [
  { name: 'Diploma in DevOps Engineering', issuer: 'Mundos E', date: 'Apr 2025' },
  { name: 'React.js', issuer: 'Coder House', date: 'Jun 2023' },
  { name: 'JavaScript', issuer: 'Coder House', date: 'Jun 2023' },
  { name: 'Web Development', issuer: 'Coder House', date: 'Mar 2023' },
  { name: 'Git Version Control', issuer: 'Gugler', date: 'Jan 2023' },
  { name: 'Java Programming, Level 1', issuer: 'Gugler', date: 'Jul 2020' },
  { name: 'English, Advanced (Conversational and Written Fluency)', issuer: 'Advance', date: 'Dec 2014' },
];

export const education = [
  {
    school: 'Autonomous University of Entre Ríos',
    degree: "Associate Degree: Information Systems",
    detail: 'Minor: Information Systems Analyst',
    period: 'Graduated 2025',
  },
  {
    school: 'Centenario High School',
    degree: 'High School Diploma: Economics',
    detail: 'Minor: Economics and Administration',
    period: '2011 · 2015',
  },
];

export const languages = [
  { name: 'Spanish', level: 'Native' },
  { name: 'English', level: 'Fluent · Professional Working Proficiency' },
];