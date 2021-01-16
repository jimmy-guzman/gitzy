/* eslint-disable no-console */
const fs = require('fs')
const childProcess = require('child_process')
const kleur = require('kleur')

const filterRegex = /@oclif\/.*/

const updateDeps = (deps, isDev = false) => {
  Object.keys(deps).forEach(dep => {
    if (filterRegex.test(dep)) {
      console.log(kleur.green(`Updated ${dep} to latest`))
      childProcess.execSync(`yarn add ${isDev ? '-D' : ''} ${dep}@latest`)
    } else {
      console.log(kleur.yellow(`Skipping ${dep}`))
    }
  })
}

fs.readFile('./package.json', (err, data) => {
  if (err) throw err

  const { dependencies, devDependencies } = JSON.parse(data)

  console.log(kleur.cyan(`Updating dependencies to latest\n`))

  updateDeps(dependencies)

  console.log(kleur.cyan(`\nUpdating devDependencies to latest\n`))

  updateDeps(devDependencies, true)
})
