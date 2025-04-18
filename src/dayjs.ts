import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/en";

dayjs.extend(customParseFormat);
dayjs.locale("en");

export default dayjs;
