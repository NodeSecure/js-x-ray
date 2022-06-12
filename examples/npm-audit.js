const path = require("path")

const sanitizeAudit = auditResult => {
  const sanitizedActions = []

  auditResult.actions.map(action => {
    if (action.module !== "cordova-plugin-inappbrowser") {
      sanitizedActions.push(action)
    }
  })

  const sanitizedAdvisories = {}
  for (let [key, value] of Object.entries(auditResult.advisories)) {
    if (value.module_name !== "cordova-plugin-inappbrowser") {
      sanitizedAdvisories[key] = value
    }
  }
  auditResult.actions = sanitizedActions
  auditResult.advisories = sanitizedAdvisories

  return auditResult
}

const patchAudit = nodeLocation => {
  const auditScriptLocation = path.join(
    nodeLocation,
    "../../lib/node_modules/npm/lib/install/audit.js"
  )
  require(auditScriptLocation)
  const auditCache = require.cache[auditScriptLocation]
  // console.log(auditCache);
  const origPrintFullReport = auditCache.exports.printFullReport
  const newPrintFullReport = auditResult => {
    console.error("Running modified npm audit")
    auditResult = sanitizeAudit(auditResult)
    return origPrintFullReport(auditResult)
  }
  auditCache.exports.printFullReport = newPrintFullReport

  const origInstallReport = auditCache.exports.printInstallReport
  const newInstallReport = auditResult => {
    console.error("Running modified npm audit")
    auditResult = sanitizeAudit(auditResult)
    return origInstallReport(auditResult)
  }
  auditCache.exports.printInstallReport = newInstallReport
}

module.exports = patchAudit
