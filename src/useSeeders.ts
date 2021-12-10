import { configureConnection, getConnectionOptions } from './connection'
import { SeederImportationError } from './errors/SeederImportationError'
import { runSeeder } from './runSeeder'
import { Seeder } from './seeder'
import { ClassConstructor, ConnectionConfiguration } from './types'
import { calculateFilePaths } from './utils/fileHandling'

export async function useSeeders(
  executeSeeders?: boolean,
  options?: Partial<ConnectionConfiguration>,
): Promise<ClassConstructor<Seeder>[]>
export async function useSeeders(
  executeSeeders?: boolean,
  seeders?: string[],
  options?: Partial<ConnectionConfiguration>,
): Promise<ClassConstructor<Seeder>[]>

export async function useSeeders(
  executeSeeders?: boolean,
  seedersOrOptions?: string[] | Partial<ConnectionConfiguration>,
  options?: Partial<ConnectionConfiguration>,
) {
  const shouldExecuteSeeders = Boolean(executeSeeders)
  const seeders = Array.isArray(seedersOrOptions) ? seedersOrOptions : undefined
  const customOptions = Array.isArray(seedersOrOptions) ? options : seedersOrOptions

  await configureConnection(customOptions)
  const option = await getConnectionOptions()

  let seederFiles = calculateFilePaths(option.seeds)
  if (seeders) {
    const seedersDesired = calculateFilePaths(seeders)
    seederFiles = seederFiles.filter((factoryFile) => seedersDesired.includes(factoryFile))
  }

  let seedersImported: ClassConstructor<Seeder>[]
  try {
    seedersImported = await Promise.all(
      seederFiles.map((seederFile) => import(seederFile).then((module) => module.default)),
    ).then((importedElements) =>
      Object.values(importedElements).filter((value) => Object.prototype.toString.call(value) === '[object Function]'),
    )

    if (shouldExecuteSeeders) {
      for (const seeder of seedersImported) {
        await runSeeder(seeder)
      }
    }
  } catch (error: any) {
    throw new SeederImportationError(error.message)
  }

  return seedersImported
}