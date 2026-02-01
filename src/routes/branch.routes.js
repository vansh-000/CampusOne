import { Router } from 'express';
import {
  changeBranchStatus,
  checkBranchCodeExists,
  createBranch,
  deleteBranch,
  getBranchByDepartment,
  getBranchById,
  getBranchesByInstitution,
  updateBranch
} from '../controllers/branch.controller.js';
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';

const router = Router();

// public routes
router.get('/institutions/:institutionId', getBranchesByInstitution);
router.get('/:branchId', getBranchById);
router.get('/departments/:departmentId', getBranchByDepartment);


router.post('/institutions/:institutionId', createBranch);
router.put('/:branchId', updateBranch);
router.delete('/:branchId', deleteBranch);
router.patch('/:branchId/status', changeBranchStatus);
router.post("/code-exists", validateInstitutionJWT, checkBranchCodeExists);

export default router;