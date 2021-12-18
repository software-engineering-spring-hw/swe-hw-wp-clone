import { useMemo, RefObject } from "react";
import { loggedInUser } from "services/auth";
import { Message } from "interfaces/interfaces";
import { Typography } from "@material-ui/core";
import { classNamesGenerator, timeDisplayer } from "@guybendavid/utils";
import "./Conversation.scss";

interface Props {
  messages?: Message[];
  chatBottomRef: RefObject<HTMLDivElement>;
}

const Conversation = ({ messages = [], chatBottomRef }: Props) => {
  const firstIndexesOfSeries = useMemo(() => {
    if (messages.length > 0) {
      const firstMessagesOfSeries: Message[] = [];

      // eslint-disable-next-line
      const indexes = messages.map((message: Message, index: number) => {
        if (firstMessagesOfSeries.length === 0) {
          firstMessagesOfSeries.push(message);
          return index;
        } else {
          const lastMessageInArr = firstMessagesOfSeries[firstMessagesOfSeries.length - 1];

          if (message.senderId !== lastMessageInArr.senderId) {
            firstMessagesOfSeries.push(message);
            return index;
          }
        }
      });

      return indexes;
    }
  }, [messages]);

  return (
    <div className="conversation">
      {messages?.map((message, index) => (
        <div key={index} className={classNamesGenerator("message",
          message.senderId === loggedInUser?.id && "sent-message",
          firstIndexesOfSeries?.includes(index) && "first-of-series")}>
          <Typography component="span" className="title">{message.content}</Typography>
          <Typography component="small">{timeDisplayer(message.createdAt)}</Typography>
        </div>
      ))}
      <div className="chat-bottom" ref={chatBottomRef}></div>
    </div>
  );
};

export default Conversation;