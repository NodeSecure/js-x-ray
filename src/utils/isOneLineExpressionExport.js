// Import Internal Dependencies
import { exportAssignmentHasRequireLeave } from "./exportAssignmentHasRequireLeave";

export function isOneLineExpressionExport(body) {
  if (body.length > 1) {
    return false;
  }

  if (body[0].type !== "ExpressionStatement") {
    return false;
  }

  if (body[0].expression.type !== "AssignmentExpression") {
    return false;
  }

  return exportAssignmentHasRequireLeave(body[0].expression.right);
}
