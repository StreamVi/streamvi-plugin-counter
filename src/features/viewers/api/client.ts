import axios from 'axios'
import { config } from '../../../config'
import type {
  CentrifugoChannelAccessTokenResponse,
  CentrifugoConnectionAccessTokenResponse,
  IntegrationTemplateWidgetResponse,
  MethodBroadcastRestreamsResponse,
  ProjectInfoResponse,
  SiteBroadcastControllerStatus0200Response,
  SitePlatformsSupportedResponse,
} from './contracts'
import type { WidgetPayload } from '../types'

const http = axios.create({
  baseURL: config.apiHost,
})

export async function getProjectInfo(tokenId: string): Promise<ProjectInfoResponse> {
  const { data } = await http.get<ProjectInfoResponse>('/method/project/get_project_info', {
    params: {
      widget: tokenId,
      v: '1',
    },
  })

  return data
}

export const getCentrifugoConnectionToken = (tokenId: string) => async () => {
  const { data } = await http.get<CentrifugoConnectionAccessTokenResponse>('/method/centrifuge/auth/connect', {
    params: {
      widget: tokenId,
      v: '1',
      language: 'ru',
    },
  })

  return data.access_token
}

export async function getChannelToken(
  tokenId: string,
  channelName: string,
): Promise<CentrifugoChannelAccessTokenResponse> {
  const { data } = await http.get<CentrifugoChannelAccessTokenResponse>('/method/centrifuge/auth/channel', {
    params: {
      channel_name: channelName,
      widget: tokenId,
      v: '1',
    },
  })

  return data
}

export async function getBroadcastChannelToken(
  tokenId: string,
  broadcastId: number,
): Promise<CentrifugoChannelAccessTokenResponse> {
  return getChannelToken(tokenId, `$broadcast:${broadcastId}`)
}

export async function getBroadcastStatus(
  tokenId: string,
  projectId: number,
): Promise<SiteBroadcastControllerStatus0200Response> {
  const { data } = await http.get<SiteBroadcastControllerStatus0200Response>(
    '/method/broadcast/status',
    {
      params: {
        language: 'ru',
        project_id: projectId,
        widget: tokenId,
        v: '1',
      },
    },
  )

  return data
}

export async function getBroadcastRestreams(
  tokenId: string,
  broadcastId: number,
): Promise<MethodBroadcastRestreamsResponse> {
  const { data } = await http.get<MethodBroadcastRestreamsResponse>(
    '/method/broadcast/restreams',
    {
      params: {
        language: 'ru',
        broadcast_id: broadcastId,
        key: tokenId,
        widget: tokenId,
        v: '2',
      },
    },
  )

  return data
}

export async function getPlatforms(tokenId: string): Promise<SitePlatformsSupportedResponse> {
  const { data } = await http.get<SitePlatformsSupportedResponse>('/method/platforms/list', {
    params: {
      language: 'ru',
      widget: tokenId,
      v: '1',
    },
  })

  return data
}

export async function getTemplateWidget(
  tokenId: string,
  templateId: string,
): Promise<WidgetPayload | null> {
  const { data } = await http.get<IntegrationTemplateWidgetResponse>(
    '/method/integration-template/widget/get',
    {
      params: {
        template_id: templateId,
        widget: tokenId,
        v: '1',
        language: 'ru',
      },
    },
  )

  return data.payload ?? data.data?.payload ?? null
}
