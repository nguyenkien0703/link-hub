import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@defikit.net' },
    update: {},
    create: {
      email: 'admin@defikit.net',
      password: hashedPassword,
    },
  })

  // Create environments
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

  // Create sample projects
  const monitor = await prisma.project.upsert({
    where: { id: 'sample-monitor' },
    update: {},
    create: {
      id: 'sample-monitor',
      name: 'OpenRouter Monitor',
      description: 'Monitor OpenRouter API usage',
      emoji: '📊',
      color: '#8b5cf6',
      order: 0,
    },
  })

  const oncall = await prisma.project.upsert({
    where: { id: 'sample-oncall' },
    update: {},
    create: {
      id: 'sample-oncall',
      name: 'On-Call System',
      description: 'Alerting and on-call management',
      emoji: '🚨',
      color: '#ef4444',
      order: 1,
    },
  })

  const lumi = await prisma.project.upsert({
    where: { id: 'sample-lumi' },
    update: {},
    create: {
      id: 'sample-lumi',
      name: 'Lumi Tracking',
      description: 'Token tracking for Lumi',
      emoji: '🌙',
      color: '#f59e0b',
      order: 2,
    },
  })

  // Get environments
  const prodEnv = await prisma.environment.findUnique({ where: { name: 'prod' } })
  const stgEnv = await prisma.environment.findUnique({ where: { name: 'stg' } })

  if (prodEnv && stgEnv) {
    // Sample links
    const links = [
      {
        name: 'OpenRouter Monitor',
        url: 'https://openrouter-monitor.defikit.net',
        description: 'Monitor API costs and usage',
        projectId: monitor.id,
        environmentId: prodEnv.id,
      },
      {
        name: 'On-Call Dashboard',
        url: 'https://oncall.defikit.net',
        description: 'PagerDuty-style alerting',
        projectId: oncall.id,
        environmentId: prodEnv.id,
      },
      {
        name: 'Lumi Tracking',
        url: 'https://lumi-tracking.defikit.net',
        description: 'Track token performance',
        projectId: lumi.id,
        environmentId: prodEnv.id,
      },
      {
        name: 'Lumi Tracking (Staging)',
        url: 'https://lumi-tracking-stg.defikit.net',
        description: 'Staging environment',
        projectId: lumi.id,
        environmentId: stgEnv.id,
      },
    ]

    for (const link of links) {
      await prisma.link.create({ data: link }).catch(() => {})
    }
  }

  console.log('✅ Seed completed')
  console.log('📧 Email: admin@defikit.net')
  console.log('🔑 Password: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
