import { useMemo, RefObject, useContext } from "react";
import { css, cx } from "@emotion/css";
import { getAuthData } from "services/auth";
import { Message } from "types/types";
import { Typography } from "@material-ui/core";
import { timeDisplayer } from "@guybendavid/utils";
import { verticalOverflowHandler } from "styles/reusable-css-in-js-styles";
import backgroundImage from "images/conversation-background.jpg";
import { PIN_MESSAGE, UNPIN_MESSAGE } from "services/graphql";
import { useMutation } from "@apollo/client";
import { AppContext, AppContextType } from "contexts/AppContext";

export type ConversationMessage = Omit<Message, "recipientId">;

type Props = {
  messages?: ConversationMessage[];
  chatBottomRef: RefObject<HTMLDivElement>;
};

const Conversation = ({ messages = [], chatBottomRef }: Props) => {
  const { loggedInUser } = getAuthData();

  const [pinMessage] = useMutation(PIN_MESSAGE);
  const [unpinMessage] = useMutation(UNPIN_MESSAGE);

  const firstIndexesOfSeries = useMemo(() => {
    if (messages.length === 0) return [];
    const firstMessagesOfSeries: ConversationMessage[] = [];

    // eslint-disable-next-line
    const indexes = messages.map((message: ConversationMessage, index: number) => {
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
  }, [messages]);

  const pinnedMessages = messages.filter(msg => msg.isPinned);
  const normalMessages = messages.filter(msg => !msg.isPinned);

  const togglePinMessage = async (id: string, isPinned: boolean) => {
    if (isPinned) {
      await unpinMessage({ variables: { id } })
    } else {
      await pinMessage({ variables: { id }})
    }
  };

  return (
    <div className={style}>
      {pinnedMessages.map((message, index) => (
        <div onClick={() => togglePinMessage(message.id, true)} key={index} className={cx("message",
          message.senderId === loggedInUser.id && "is-sent-message",
          firstIndexesOfSeries.includes(index) && "is-first-of-series")}>
          <Typography component="span">{message.content}</Typography>
          <Typography component="small">{timeDisplayer(message.createdAt)} 📌</Typography>
        </div>
      ))}
      <div>
        <hr/>
      </div>
      {messages.map((message, index) => (
        <div onClick={() => togglePinMessage(message.id, false)} key={index} className={cx("message",
          message.senderId === loggedInUser.id && "is-sent-message",
          firstIndexesOfSeries.includes(index) && "is-first-of-series")}>
          <Typography component="span">{message.content}</Typography>
          <Typography component="small">{timeDisplayer(message.createdAt)}</Typography>
        </div>
      ))}
      <div className="chat-bottom" ref={chatBottomRef} />
    </div>
  );
};

export default Conversation;

const style = css`
  scroll-behavior: smooth;
  background: url(${backgroundImage});
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  padding: 20px 70px 80px;
  gap: 5px;

  .message {
    position: relative;
    width: fit-content;
    min-width: 23px;
    max-width: 50%;
    padding: 5px 80px 5px 10px;
    border-radius: 5px;

    &.is-sent-message {
      align-self: flex-end;
      background: #dcf8c6;

      &.is-first-of-series {
        &::before {
          border-top: 12px solid #dcf8c6;
          right: -12px;
        }
      }
    }

    &:not(.is-sent-message) {
      background: white;

      &.is-first-of-series {
        &::before {
          border-top: 12px solid #fff;
          left: -12px;
        }
      }
    }

    &.is-first-of-series {
      &::before {
        content: "";
        position: absolute;
        top: 0;
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
      }
    }

    span {
      ${verticalOverflowHandler(7)};
      min-height: 25px;
    }

    small {
      position: absolute;
      right: 10px;
      bottom: 2px;
    }
  }
`;