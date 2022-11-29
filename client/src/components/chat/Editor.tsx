import { Form, Input, Button, Row, Col, Avatar, Comment } from 'antd';
import { CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import { User } from '../../entities';
import { ChatMessageReplyProps } from '../../entities/chat';
import axios from 'axios';
import './Editor.css';


interface EditorProps {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  submitting: boolean;
  value: string;
  rows?: number;
}

interface ReplyFormProps {
  session: User;
  channel: string;
  replyTo?: ChatMessageReplyProps;
  setReplyTo: (replyTo?: ChatMessageReplyProps) => void;
  style?: any;
  channelName?: string;
  rows?: number;
}

const { TextArea } = Input;

const ReplyTo = ({ message, setReplyTo }: { message?: ChatMessageReplyProps, setReplyTo: (message?: ChatMessageReplyProps) => void }) => (
  <Row wrap={false} align="middle" className="reply-to-placeholder">
    <Col flex="auto">
      {message?.text}
    </Col>
    <Col flex="none">
      <Button type="text" icon={<CloseOutlined />} onClick={() => setReplyTo()} />
    </Col>
  </Row>
);

const Editor = ({ onChange, onSubmit, submitting, value, rows = 4 }: EditorProps) => (
  <>
    <Form.Item>
      <TextArea rows={rows} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Send
      </Button>
    </Form.Item>
  </>
);

const ReplyForm = ({ session, channel, replyTo, setReplyTo, style, channelName, rows }: ReplyFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');

  const handleSubmit = async (replyTo: ChatMessageReplyProps | undefined) => {
    if (!value) return;
    setSubmitting(true);
    await axios.post(`/chat/${channel}/message`, {
      text: value,
      replyToId: replyTo?.id,
      createChannel: channelName
    })
    setSubmitting(false);
    setValue('');
    setReplyTo(undefined);
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <Comment
      className="reply-field"
      style={style}
      avatar={<Avatar src={session.picture} alt={session.name} />}
      content={
        <>
          {replyTo?.id && <ReplyTo message={replyTo} setReplyTo={setReplyTo} />}
          <Editor
            onChange={handleChange}
            onSubmit={() => handleSubmit(replyTo)}
            submitting={submitting}
            value={value}
            rows={rows}
          />
        </>
      }
    />
  )
};

export default ReplyForm;
