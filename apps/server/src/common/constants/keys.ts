export const IS_PUBLIC = 'isPublic';
export const ACCESS_TOKEN = 'timelapse_access_token';
export const REFRESH_TOKEN = 'timelapse_refresh_token';
export const REQUIRE_ROLE = 'requireRole';

export const RESIZED_VERSIONS = {
  _1920: '1920' as const,
  _720: '720' as const,
  _480: '480' as const,
  _150: '150' as const,
  thumb: 'thumb' as const,
} as const;

export const RESIZED_VERSIONS_LIST = Object.values(RESIZED_VERSIONS);

export type IResizedVersion =
  (typeof RESIZED_VERSIONS)[keyof typeof RESIZED_VERSIONS];

export const SYNC_PHOTO_TASK_NAME = 'tasks.image_tasks.sync_photos_task';
export const CREATE_TIMELAPSE_VIDEO_TASK_NAME =
  'tasks.image_tasks.create_timelapse_video_task';
export const RESIZE_IMAGE_TASK_NAME = 'tasks.image_tasks.resize_image_task';
