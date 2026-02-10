import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
                         `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}` +
                         `?schema=${process.env.DB_SCHEMA}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })


async function main() {

  // Fetch all users with their user types
  const allUsers = await prisma.user.findMany({
    include: {
      userType: true,
    },
  })
  console.log('All users:', JSON.stringify(allUsers, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })