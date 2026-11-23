export type Project = {
  name: string
  category: 'Professional' | 'Freelance' | 'Personal'
  description: string
  details: string
  stack?: string
  live?: string
  code?: string
}
export const projects: Project[] = [
  { name: 'Office CRM', category: 'Professional', description: 'A desktop operations hub for a social media agency.', details: 'An editable client calendar connects briefs, designer assignments, manager approvals, chat and reporting. When a designer is absent, open work can be reassigned while preserving its revision history.', stack: 'Electron.js · React · Node.js · MySQL · SQLite' },
  { name: 'Itinerary Builder', category: 'Professional', description: 'Trip planning and quotation management for travel agencies.', details: 'Agents arrange hotels, transport, sightseeing and meals in a day-by-day itinerary. A pricing engine calculates per-person costs and preserves each version of a quotation before PDF export.', stack: 'React · Express · PostgreSQL' },
  { name: 'Restora', category: 'Professional', description: 'Restaurant ordering, kitchen tickets and billing in one workspace.', details: 'Staff track dine-in, takeaway and delivery orders from acceptance to service. QR waiter calls, table views, inventory and sales reports support the front and back of house.' },
  { name: 'Lenden Cashbook', category: 'Professional', description: 'Cash records and transfers across multiple businesses.', details: 'Staff record cash in and out by category, bank and branch. Company administrators can track inter-business transfers and generate reports for a selected period.', live: 'https://lenden.encodersunlimited.com/' },
  { name: 'Gold Loan CRM', category: 'Professional', description: 'A spreadsheet-style workspace for retailers and wholesalers.', details: 'A keyboard-friendly grid handles loan tranches, monthly interest and interest-first repayment allocation. The system checks lending limits against gold value and generates PDF reports.' },
  { name: 'Siliguri Toys', category: 'Professional', description: 'An online toy shop with a full order-management workflow.', details: 'Customers browse the catalogue, add products to their cart and check out. An admin interface helps the store manage incoming orders.', stack: 'MongoDB · Express · React · Node.js', live: 'https://siliguritoys.com/' },
  { name: 'Billing Manager', category: 'Freelance', description: 'An offline Windows billing application for DigiTetra.', details: 'A local SQLite database keeps client packages, invoices and payments accessible offline. The app tracks balances, sends milestone and expiry reminders, and preserves package history across renewals.', stack: 'Electron.js · React · TypeScript · SQLite' },
  { name: 'Doctor Appointment Booking', category: 'Personal', description: 'Online appointments and payments for doctors and patients.', details: 'Patients book and track appointments, doctors manage schedules and earnings, and administrators oversee the service through separate account roles.', stack: 'MERN', code: 'https://github.com/Biswajit-Sao/Doctor-Appointment-Booking-System', live: 'https://astonishing-treacle-d0653d.netlify.app/' },
  { name: 'Job Portal', category: 'Personal', description: 'Job discovery and applicant tracking for recruiters.', details: 'Job seekers filter openings by location, skills and experience, then upload a résumé and apply. Recruiters review applications and manage hiring decisions.', stack: 'MERN · Redux', code: 'https://github.com/Biswajit-Sao/job-portal', live: 'https://job-portal-nlty.onrender.com/' },
  { name: 'E-Commerce Platform', category: 'Personal', description: 'A storefront with Razorpay checkout and inventory controls.', details: 'The shop includes filtering, sorting, a shopping cart and cash-on-delivery checkout. Admins manage products, inventory and orders.', stack: 'MERN', code: 'https://github.com/Biswajit-Sao/e-commerce', live: 'https://e-commerce-bs.netlify.app/' }
]
export const photos = [
  {file: 'studio', title: 'Studio portrait', alt: 'Biswajit in a lavender shirt and sunglasses against a dark studio background'},
  {file: 'cafe', title: 'At the café', alt: 'Biswajit seated at a café table in a teal shirt'},
  {file: 'portrait', title: 'Natural light', alt: 'Side portrait of Biswajit in a teal shirt'},
  {file: 'sunlight', title: 'In the sunlight', alt: 'Close-up of Biswajit wearing sunglasses and a white shirt'}
]
export const documents = [
  {name: 'Résumé', file: 'Biswajit_Sao_Resume.pdf', pages: 2},
  {name: 'Curriculum vitae', file: 'Biswajit_Sao_CV.pdf', pages: 3}
]
export const skills = [
  ['Languages', 'JavaScript', 'TypeScript', 'Java', 'C'],
  ['Frontend', 'React.js', 'Tailwind CSS', 'HTML5', 'CSS3'],
  ['Backend', 'Node.js', 'Express.js', 'REST APIs', 'PHP'],
  ['Databases', 'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite'],
  ['Desktop & deployment', 'Electron.js', 'Docker', 'VPS', 'n8n'],
  ['Developer tools', 'Git', 'GitHub', 'VS Code', 'Vite', 'Postman', 'Figma']
]
export const email = 'saobiswajit@gmail.com'
export const github = 'https://github.com/Biswajit-Sao'
export const linkedin = 'https://www.linkedin.com/in/biswajit-sao-6581a9359/'
