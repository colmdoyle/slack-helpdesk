import { Block, PlainTextElement } from "@slack/types";
import { plainTextInput, option, inputSelectStatic, divider } from '../block-kit/block-builder'
import { buildModal } from "../block-kit/view-builder";
import { modalFields, modalCallbacks } from '../constants'


interface ViewsPayload {
    type: "modal",
    callback_id: string,
    title: PlainTextElement,
    blocks: Block[],
    submit?: PlainTextElement,
    private_metadata?: string,
    close?: PlainTextElement
}

export function issueCreateModal(): ViewsPayload {
    return buildModal(
        `IT Support Request`,
        [
            divider(),
            plainTextInput("How can we help?", modalFields.issueTitle, "Brief description of the issue"),
            plainTextInput("Can you give us more detail?", modalFields.issueDescription, "What information might we need to help you?", true),
            inputSelectStatic(
                "How urgent is this problem?",
                "priority",
                [
                    option('Low', '4'),
                    option('Medium', '3'),
                    option('High', '2'),
                    option('Work stopping', '1'),
                ],
                modalFields.urgency
            ),
            inputSelectStatic(
                "Where are you experiencing this issue?",
                "location",
                [
                    option('Dublin', 'dublin'),
                    option('London', 'london'),
                    option('Paris', 'paris'),
                    option('Munich', 'munich'),
                ],
                modalFields.location
            ),
        ],
        modalCallbacks.createIssue,
        `Create`
    )
    }