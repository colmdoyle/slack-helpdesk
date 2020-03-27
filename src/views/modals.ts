import { Block, PlainTextElement } from "@slack/types";
import { plainTextInput, option, inputSelectStatic, divider, section } from '../block-kit/block-builder'
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
                    option('Highest', '1'),
                ],
                modalFields.urgency
            ),
        ],
        modalCallbacks.createIssue,
        `Create`
    )
}

export function issueCreatedModal(ticketReference: string): ViewsPayload {
    return buildModal(
        `Ticket filed!`,
        [
            divider(),
            section(`Thanks for getting in touch. We're tracking your request in ticket *<${process.env.ATLASSIAN_BASE_WEB_UI}/servicedesk/customer/portal/1/${ticketReference}|${ticketReference}>*. For your reference, we've also sent you a DM with a link to this. \n\n Have a great day!`)
        ],
        modalCallbacks.issueCreated
    )
}