import {Controller, Get, Route} from 'tsoa';
import {checkDbHealth} from '../db';
import useSendMail from '../hooks/use-send-mail';

@Route('/api/health')
export class HealthController extends Controller {
  @Get('/')
  public async getHealth() {
    let dbStatus = 'unknown';
    let smtpStatus = 'unknown';

    try {
      const healthCheck = await checkDbHealth();
      dbStatus = healthCheck.db;
    } catch (error) {
      dbStatus = 'error';
    }

    try {
      const {testSmtpConnection} = useSendMail();
      smtpStatus = await testSmtpConnection();
    } catch (error) {
      smtpStatus = 'error';
    }

    return {
      status: 'ok',
      db: dbStatus,
      smtp: smtpStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
