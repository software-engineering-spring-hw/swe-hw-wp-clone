import { useEffect, useRef, useContext } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { SidebarUser, Message } from "types/types";
import { useQuery, useSubscription } from "@apollo/client";
import { css, cx } from "@emotion/css";
import { container } from "../shared-styles";
import { GET_MESSAGES } from "services/graphql";
import { GET_GROUP_MESSAGES, NEW_GROUP_MESSAGE } from "services/group-graphql";
import { addNewMessageToChat } from "services/chat-helper";
import ChatHeader from "./ChatHeader/ChatHeader";
import Conversation from "./Conversation/Conversation";
import MessageCreator from "./MessageCreator/MessageCreator";

type Props = {
  selectedUser: SidebarUser;
  newMessage?: Message;
};

const Chat = ({ selectedUser, newMessage }: Props) => {
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { handleServerErrors } = useContext(AppContext) as AppContextType;

  // Detect if selectedUser is a group (id format or extra prop)
  const isGroup = !selectedUser.lastName && !selectedUser.image;

  // Use group or direct messages query
  const { data, client } = useQuery(
    isGroup ? GET_GROUP_MESSAGES : GET_MESSAGES,
    {
      variables: isGroup ? { groupId: selectedUser.id } : { otherUserId: selectedUser.id },
      onError: (error) => handleServerErrors(error)
    }
  );

  const messages = isGroup ? data?.getGroupMessages || [] : data?.getMessages || [];

  // Real-time group message subscription
  const { data: subData } = useSubscription(NEW_GROUP_MESSAGE, {
    skip: !isGroup,
    variables: { groupId: selectedUser.id }
  });

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView();
    }
  }, [messages]);

  useEffect(() => {
    if (newMessage && !messages.some((message: Message) => message.id === newMessage.id)) {
      const { recipientId, ...relevantMessageFields } = newMessage;
      addNewMessageToChat(relevantMessageFields, client, selectedUser.id);
      selectedUser.latestMessage = { ...newMessage };
      chatBottomRef.current?.scrollIntoView();
    }
  }, [newMessage]);

  useEffect(() => {
    if (isGroup && subData?.newGroupMessage) {
      const existing = client.readQuery({
        query: GET_GROUP_MESSAGES,
        variables: { groupId: selectedUser.id }
      }) as any;

      const alreadyExists = existing?.getGroupMessages?.some(
        (msg: any) => msg.id === subData.newGroupMessage.id
      );

      if (!alreadyExists) {
        client.writeQuery({
          query: GET_GROUP_MESSAGES,
          variables: { groupId: selectedUser.id },
          data: {
            getGroupMessages: [
              ...(existing?.getGroupMessages || []),
              subData.newGroupMessage
            ]
          }
        });
      }
      chatBottomRef.current?.scrollIntoView();
    }
  }, [subData, isGroup, client, selectedUser.id]);

  return (
    <div className={cx(style, container)}>
      <ChatHeader selectedUser={selectedUser} />
      <Conversation messages={messages} chatBottomRef={chatBottomRef} isGroup={isGroup} />
      <MessageCreator selectedUser={selectedUser} />
    </div>
  );
};

export default Chat;

const style = css`
  display: flex;
  flex-direction: column;
  position: relative;
  background: #f8f9fa;
  border-radius: 10px;
`;