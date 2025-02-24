import { Message } from "postcss";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean
    messages?: Array<Message>
}