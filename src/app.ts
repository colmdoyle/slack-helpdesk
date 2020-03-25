/* eslint-disable @typescript-eslint/camelcase */
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

import { App } from '@slack/bolt'

import { issueCreateModal } from './views/modals';
import { modalCallbacks, modalFields } from './constants';

const botToken = process.env.BOT_TOKEN;

const app = new App({
    signingSecret: process.env.SIGNING_SECRET,
    token: botToken
});

const atlassianAPIURL = process.env.ATLASSIAN_BASE_URL;

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

app.command('/helpdesk', ({ respond, ack, context, body }) => {
    respond('hello');
    app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: issueCreateModal()
    })
    ack();
});

app.view({ callback_id: modalCallbacks.createIssue }, ({ ack, body }) => {
    ack();
    const state : ModalStatePayload = body.view.state;
    console.log(state.values[modalFields.urgency][modalFields.urgency].selected_option!.value);
    axios.post(`${atlassianAPIURL}/issue`, {
        fields: {
            summary: state.values[modalFields.issueTitle][modalFields.issueTitle].value,
            description: state.values[modalFields.issueDescription][modalFields.issueDescription].value,
            project: {
                id: '10000'
            },
            issuetype: {
                id: '10005'
            },
            priority: {
                id: state.values[modalFields.urgency][modalFields.urgency].selected_option!.value
            }
        }
    },
    {
        headers: {
            'Authorization' : `Basic ${process.env.ATLASSIAN_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'        
        }
    }
    ).then((response) => {
        console.log(response.data);
    }).catch((error) => {
        console.error(error);
    })
});

(async (): Promise<void> => {
    // Start your app
    await app.start(process.env.PORT || 3000);
    console.log('Bolt is ready and waiting...');
})();