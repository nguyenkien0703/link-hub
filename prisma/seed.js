const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@defikit.net'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create default environments
  const environments = [
    { name: 'prod', displayName: 'Production', order: 0 },
    { name: 'stg', displayName: 'Staging', order: 1 },
    { name: 'dev', displayName: 'Development', order: 2 },
  ]

  for (const env of environments) {
    await prisma.environment.upsert({
      where: { name: env.name },
      update: {},
      create: env,
    })
  }

  console.log('✅ Seed completed')
  console.log(`📧 Admin email: ${adminEmail}`)
  console.log(`🔑 Admin password: ${adminPassword}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
