import { toast } from "react-toastify";


class NotificationService {

  public success(message: string) {
    toast.success(message);
  }

  public error(message: string) {
    toast.error(message);
  }

  public info(message: string) {
    toast.info(message);
  }

  public warning(message: string) {
    toast.warning(message);
  }

}

export default new NotificationService();