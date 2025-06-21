import { useMemo, RefObject } from "react";
import { css, cx } from "@emotion/css";
import { getAuthData } from "services/auth";
import { Message } from "types/types";
import { Typography } from "@material-ui/core";
import { timeDisplayer } from "@guybendavid/utils";
import { verticalOverflowHandler } from "styles/reusable-css-in-js-styles";
import backgroundImage from "images/conversation-background.jpg";

export type ConversationMessage = Omit<Message, "recipientId">;

// Add a type for group messages with sender
export type GroupConversationMessage = ConversationMessage & {
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
};

type Props = {
  messages?: (ConversationMessage | GroupConversationMessage)[];
  chatBottomRef: RefObject<HTMLDivElement>;
  isGroup?: boolean;
};

const Conversation = ({ messages = [], chatBottomRef, isGroup }: Props) => {
  const { loggedInUser } = getAuthData();

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

  return (
    <div className={style}>
      {messages.map((message, index) => {
        const groupMsg = message as GroupConversationMessage;
        const isOwn = message.senderId === loggedInUser.id;
        // SYSTEM MESSAGE: senderId is null
        if (isGroup && message.senderId == null) {
          return (
            <div key={index} style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', margin: '8px 0', fontSize: 13 }}>
              {message.content}
              <div style={{ fontSize: 11, marginTop: 2 }}>
                {message.createdAt && !isNaN(Date.parse(message.createdAt))
                  ? timeDisplayer(message.createdAt)
                  : "-"}
              </div>
            </div>
          );
        }
        return (
          <div key={index} className={cx("message",
            isOwn && "is-sent-message",
            firstIndexesOfSeries.includes(index) && "is-first-of-series")}
          >
            {isGroup && groupMsg.sender && !isOwn && (
              <Typography component="div" style={{ fontWeight: 600, fontSize: 13, color: '#2e7d32', marginBottom: 2 }}>
                {groupMsg.sender.firstName} {groupMsg.sender.lastName}
              </Typography>
            )}
            <Typography component="span" style={{ display: 'block', marginBottom: 16 }}>{message.content}</Typography>
            <Typography component="small" style={{ display: 'block', color: '#888', fontSize: 12, marginTop: -12, marginBottom: 2, textAlign: isOwn ? 'right' : 'left', position: 'static' }}>
              {message.createdAt && !isNaN(Date.parse(message.createdAt))
                ? timeDisplayer(message.createdAt)
                : "-"}
            </Typography>
          </div>
        );
      })}
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