import { parseISO, isValid } from "date-fns";

type Props = {
  dateString: string;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" });

const DateFormatter = ({ dateString }: Props) => {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return null;
  }
  return <time dateTime={dateString}>{dateFormatter.format(date)}</time>;
};

export default DateFormatter;
