/* eslint-disable @typescript-eslint/camelcase */
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

import { App } from '@slack/bolt'

import { issueCreateModal, issueCreatedModal } from './views/modals';
import { modalCallbacks, modalFields, slashCommands, shortcuts } from './constants';

const botToken = process.env.BOT_TOKEN;

const app = new App({
    signingSecret: process.env.SIGNING_SECRET,
    token: botToken
});

const atlassianAPIURL = process.env.ATLASSIAN_BASE_API_URL;

const slackToServiceDeskIDMap: { [key: string]: string; } = {
    "U9UFK54EA": "qm:a18f610d-47a5-4e06-a6c8-6cca9b96ba43:277eaeb4-63ed-425e-83a0-5309cfc84e53"
}

export interface ModalStatePayload {
    values: {
        [key: string]: {
            [key: string]: {
                type: string,
                value?: string,
                selected_option?: {
                    value: string
                }
            }
        }
    }
}

app.command(slashCommands.helpdesk, ({ ack, context, body }) => {
    app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: issueCreateModal()
    })
    ack();
});

app.shortcut(shortcuts.fileTicket, ({ ack, context, body }) => {
    app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: issueCreateModal()
    })
    ack();
});

app.view({ callback_id: modalCallbacks.createIssue }, ({ ack, body, context }) => {
    const state: ModalStatePayload = body.view.state;
    const summary = state.values[modalFields.issueTitle][modalFields.issueTitle].value;
    const description = state.values[modalFields.issueDescription][modalFields.issueDescription].value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const priorityID = state.values[modalFields.urgency][modalFields.urgency].selected_option!.value;


    // Create JIRA Service Desk Ticket
    axios.post(`${atlassianAPIURL}/request`, {
        raiseOnBehalfOf: slackToServiceDeskIDMap[body.user.id],
        serviceDeskId: '1',
        requestTypeId: '10007',
        requestFieldValues: {
            summary,
            description,
            priority: { id: priorityID }
        }
    },
        {
            headers: {
                'Authorization': `Basic ${process.env.ATLASSIAN_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    ).then((response) => {
        // Update modal with issue details
        ack({
            response_action: 'update',
            view: issueCreatedModal(response.data.issueKey)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        // DM Ticket details to the user
        app.client.chat.postMessage({
            token: context.botToken,
            text: `Thanks for getting in touch about "*${summary}*". We're tracking your request in ticket *<${process.env.ATLASSIAN_BASE_WEB_UI}/servicedesk/customer/portal/1/${response.data.issueKey}|${response.data.issueKey}>*. Have a great day!`,
            channel: body.user.id
        });
    }).catch((error) => {
        console.error(error);
    })
});

(async (): Promise<void> => {
    // Start your app
    await app.start(process.env.PORT || 3000);
    console.log('Bolt is ready and waiting...');
})();