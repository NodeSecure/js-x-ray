// Import Internal Dependencies
import { exportAssignmentHasRequireLeave } from "./exportAssignmentHasRequireLeave.js";

export function isOneLineExpressionExport(body) {
  if (body.length === 0 || body.length > 1) {
    return false;
  }

  const [firstNode] = body;
  if (firstNode.type !== "ExpressionStatement") {
    return false;
  }

  switch (firstNode.expression.type) {
    // module.exports = require('...');
    case "AssignmentExpression":
      return exportAssignmentHasRequireLeave(firstNode.expression.right);
    // require('...');
    case "CallExpression":
      return exportAssignmentHasRequireLeave(firstNode.expression);
    default:
      return false;
  }
}
