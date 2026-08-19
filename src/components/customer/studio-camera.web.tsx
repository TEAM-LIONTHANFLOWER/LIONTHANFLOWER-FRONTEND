/**
 * 프레임을 고른 뒤의 실시간 카메라 촬영.
 *
 * getUserMedia 로 받은 영상을 <video> 로 보여주고, 고른 프레임의 투명 PNG 를 그 위에 얹어
 * 미리보기를 만듭니다. 셔터를 누르면 Canvas 에 영상 한 프레임과 PNG 를 순서대로 그려
 * 합성한 뒤 PNG Blob 으로 만들어 상위 컴포넌트에 넘깁니다.
 */
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { StudioCapture, StudioFrame } from '@/types/studio';
import cameraIcon from '@assets/images/studio/camera.svg';
import loadingIcon from '@assets/images/studio/loading.svg';
import { STUDIO_FRAME_HEIGHT, STUDIO_FRAME_WIDTH } from '@components/customer/studio-frame-card';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';

/** 셔터 버튼 — 지름과 안쪽 카메라 아이콘 치수. `studio-frame-stage.tsx` 의 예전 값과 같습니다. */
const SHUTTER_SIZE = 70;
const SHUTTER_ICON_SIZE = 24;

type CameraStatus = 'idle' | 'requesting' | 'ready' | 'capturing' | 'denied' | 'error';

interface StudioCameraProps {
  frame: StudioFrame;
  /** 셔터를 눌러 합성이 시작되는 순간(비동기 작업 시작 전) 호출됩니다. */
  onCaptureStart: () => void;
  onCapture: (capture: StudioCapture) => void;
  /** 합성이 실패하면 호출됩니다. `onCaptureStart` 로 바뀐 상위 상태를 되돌리는 용도입니다. */
  onCaptureError: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * <video> 는 RN 컴포넌트가 아니라 DOM 태그라 `StyleSheet.create` 대신
 * 일반 CSSProperties 로 직접 스타일을 줍니다.
 */
const videoStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  backgroundColor: '#000000',
};

/** 화면에 보이는 비율(dw×dh)에 맞춰 영상 가운데를 잘라 채웁니다 — CSS `object-fit: cover` 와 같은 계산입니다. */
function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  dw: number,
  dh: number
) {
  const targetRatio = dw / dh;
  const videoRatio = video.videoWidth / video.videoHeight;

  let sw = video.videoWidth;
  let sh = video.videoHeight;
  let sx = 0;
  let sy = 0;

  if (videoRatio > targetRatio) {
    sw = video.videoHeight * targetRatio;
    sx = (video.videoWidth - sw) / 2;
  } else {
    sh = video.videoWidth / targetRatio;
    sy = (video.videoHeight - sh) / 2;
  }

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh);
}

function loadOverlayImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    // 캔버스 합성에 쓰려면 오버레이 이미지가 CORS 를 허용해야 오염되지 않습니다.
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('overlay image load failed'));
    image.src = url;
  });
}

export function StudioCamera({
  frame,
  onCaptureStart,
  onCapture,
  onCaptureError,
  style,
}: StudioCameraProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  // 합성 실패는 카메라 스트림이 살아 있는 일시적 오류라 status 를 'error' 로 두지 않고
  // 이 배너로만 알립니다. 셔터를 다시 누르면 사라집니다.
  const [captureErrorMessage, setCaptureErrorMessage] = useState<string | null>(null);

  // 컴포넌트가 사라질 때는 카메라 버튼을 눌렀었는지와 상관없이 스트림을 정리합니다.
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    },
    []
  );

  const startCamera = useCallback(async () => {
    setStatus('requesting');

    try {
      // aspectRatio 를 프레임 비율(세로로 긴 0.46)로 강제하면 브라우저가 센서 화각을
      // 그 비율에 맞추려고 세게 크롭해 화면이 과하게 확대되어 보입니다. 크롭은 이미
      // 미리보기(objectFit: cover)와 촬영(drawVideoCover)에서 처리하므로 여기서는
      // 요구하지 않습니다.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('ready');
    } catch (error) {
      const isPermissionError = error instanceof DOMException && error.name === 'NotAllowedError';
      setStatus(isPermissionError ? 'denied' : 'error');
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setStatus('capturing');
    setCaptureErrorMessage(null);
    onCaptureStart();

    try {
      const overlayImage = await loadOverlayImage(frame.overlayImageUrl);
      const canvas = document.createElement('canvas');
      canvas.width = overlayImage.naturalWidth || STUDIO_FRAME_WIDTH;
      canvas.height = overlayImage.naturalHeight || STUDIO_FRAME_HEIGHT;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('canvas context unavailable');
      }

      // 순서가 중요합니다 — 사진을 먼저 그리고, 그 위에 투명 PNG 프레임을 겹칩니다.
      drawVideoCover(ctx, video, canvas.width, canvas.height);
      ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        throw new Error('canvas toBlob failed');
      }

      onCapture({ blob, previewUrl: URL.createObjectURL(blob) });
      setStatus('ready');
    } catch {
      // 스트림은 살아 있으므로 'error' 화면으로 막지 않고 'ready' 로 되돌려 바로 다시 찍을 수 있게 합니다.
      setStatus('ready');
      setCaptureErrorMessage(t('studio.captureError'));
      onCaptureError();
    }
  }, [frame.overlayImageUrl, onCapture, onCaptureStart, onCaptureError, t]);

  // idle 에서 누르면 카메라를 켜 촬영 준비 상태로 넘어가고, ready 에서 누르면 그대로 촬영합니다.
  const handleCameraPress = useCallback(() => {
    if (status === 'idle') {
      startCamera();
    } else if (status === 'ready') {
      capturePhoto();
    }
  }, [status, startCamera, capturePhoto]);

  if (status === 'denied' || status === 'error') {
    return (
      <View style={[styles.stage, styles.message, style]}>
        <Text style={styles.messageText}>
          {status === 'denied' ? t('studio.cameraDenied') : t('studio.cameraError')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('studio.retry')}
          onPress={startCamera}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>{t('studio.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.stage, style]}>
      <video ref={videoRef} muted playsInline style={videoStyle} />

      <Image
        source={frame.overlayImageUrl}
        style={styles.overlay}
        contentFit="fill"
        accessible={false}
      />

      {captureErrorMessage ? (
        <View style={styles.captureErrorBanner}>
          <Text style={styles.captureErrorText}>{captureErrorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('a11y.shutter')}
        onPress={handleCameraPress}
        disabled={status === 'requesting' || status === 'capturing'}
        style={styles.shutter}
      >
        <Image
          source={status === 'requesting' || status === 'capturing' ? loadingIcon : cameraIcon}
          style={styles.shutterIcon}
          contentFit="contain"
          accessible={false}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shutter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    marginTop: -SHUTTER_SIZE / 2,
    marginLeft: -SHUTTER_SIZE / 2,
    borderRadius: SHUTTER_SIZE / 2,
    backgroundColor: FixedColors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIcon: {
    width: SHUTTER_ICON_SIZE,
    height: SHUTTER_ICON_SIZE,
  },
  message: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    backgroundColor: FixedColors.frameWindowFill,
    paddingHorizontal: Spacing.four,
  },
  messageText: {
    ...Typography.bodyKo14,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    backgroundColor: FixedColors.optionSurface,
  },
  retryText: {
    ...Typography.bodyKo14,
    color: FixedColors.onDark,
  },
  captureErrorBanner: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: FixedColors.scrim,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  captureErrorText: {
    ...Typography.bodyKo14,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
});
