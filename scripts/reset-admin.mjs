// Admin reset script — run with: node scripts/reset-admin.mjs
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const USERNAME = 'admin'
const EMAIL = 'admin@radhekrishanacab.com'
const PASSWORD = 'prince@2027'

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12)

  const existing = await prisma.adminUser.findFirst()

  if (existing) {
    // Update the first admin's password
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: {
        username: USERNAME,
        email: EMAIL,
        passwordHash: hash,
      },
    })
    console.log('✅ Admin credentials reset successfully!')
  } else {
    // Create a new admin
    await prisma.adminUser.create({
      data: { username: USERNAME, email: EMAIL, passwordHash: hash },
    })
    console.log('✅ Admin account created successfully!')
  }

  console.log('----------------------------')
  console.log('Username :', USERNAME)
  console.log('Email    :', EMAIL)
  console.log('Password :', PASSWORD)
  console.log('----------------------------')
  console.log('Login at: http://localhost:3000/admin/login')
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
