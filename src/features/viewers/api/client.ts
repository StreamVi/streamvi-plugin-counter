import axios from 'axios'
import { config } from '../../../config'
import type {
  CentrifugoChannelAccessTokenResponse,
  CentrifugoConnectionAccessTokenResponse,
  MethodBroadcastRestreamsResponse,
  ProjectInfoResponse,
  SiteBroadcastControllerStatus0200Response,
  SitePlatformsSupportedResponse,
} from './contracts'

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

export async function getBroadcastChannelToken(
  tokenId: string,
  broadcastId: number,
): Promise<CentrifugoChannelAccessTokenResponse> {
  const { data } = await http.get<CentrifugoChannelAccessTokenResponse>('/method/centrifuge/auth/channel', {
    params: {
      channel_name: `$broadcast:${broadcastId}`,
      widget: tokenId,
      v: '1',
    },
  })

  return data
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
        v: '1',
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
