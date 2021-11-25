import {ApprovalCodeAttr} from '../@types/models';
import {generateOTP} from '../@utils/helpers';
import Profile from '../models/profile-model';

export default class ApprovalCodeService {
  public async generateApprovalCodes() {
    const profiles = await Profile.findAll({
      attributes: ['id', 'email'],
      where: {
        type: 'stakeholder',
      },
    });
    const approvalCodes = profiles.map(p => {
      const auth: ApprovalCodeAttr = {
        profileId: Number(p.id),
        email: p.email,
        code: generateOTP(),
      };
      return auth;
    });
    return approvalCodes;
  }
}
