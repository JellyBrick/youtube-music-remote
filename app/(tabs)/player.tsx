import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ConnectionError,
  InfoView,
  LoadingView,
  PlayerControls,
  PlayerExtraActions,
} from '@/components';
import { DOMINANT_COLOR_FALLBACK } from '@/constants';
import { useDominantColor, useNowPlaying, useSettings } from '@/hooks';

const styles = StyleSheet.create({
  linearGradient: {
    height: '100%',
  },
  container: {
    flex: 1,
    gap: 8,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  albumArt: {
    borderRadius: 16,
    margin: 'auto',
    // resizeMode: 'contain',
  },
  titleAndControlsContainer: {
    justifyContent: 'flex-end',
  },
  titleAndControlsContainerLandscape: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16 * 1.25,
    fontWeight: 'bold',
  },
  artist: {
    opacity: 0.5,
  },
});

const Player = () => {
  const theme = useTheme();
  const backgroundColor =
    DOMINANT_COLOR_FALLBACK[theme.dark ? 'dark' : 'light'];

  const { t } = useTranslation('translation', { keyPrefix: 'player' });

  const { width, height } = useWindowDimensions();
  const albumArtWidth = Math.min(width - 64, height - 450);

  const { settings } = useSettings();

  const {
    data: songInfo,
    isLoading,
    isError,
    error,
    refetch,
  } = useNowPlaying();

  // TODO: Use right gradient colors for light theme
  const { color: dominantColor, isBright: isDominantColorBright } =
    useDominantColor(songInfo?.imageSrc);
  const dominantColorGradientStart = dominantColor
    ? `${dominantColor}${isDominantColorBright ? '50' : 'ff'}`
    : backgroundColor;
  const dominantColorGradientEnd = dominantColor
    ? `${dominantColor}${isDominantColorBright ? '18' : '40'}`
    : backgroundColor;

  if (error?.message === 'Network Error')
    return <ConnectionError type='noConnection' onRetry={refetch} />;

  if (isLoading) return <LoadingView />;

  if (isError) return <ConnectionError type='serverError' onRetry={refetch} />;

  if (!songInfo)
    return (
      <InfoView
        title={t('nothingIsPlaying')}
        message={t('nothingIsPlayingMessage')}
        icon='music-off'
      />
    );

  return (
    <LinearGradient
      colors={
        settings.showAlbumArtColor
          ? [dominantColorGradientStart, dominantColorGradientEnd]
          : [backgroundColor, backgroundColor]
      }
      style={[styles.linearGradient, { backgroundColor }]}
    >
      <SafeAreaView style={styles.container}>
        {songInfo.imageSrc && (
          <Image
            style={[
              styles.albumArt,
              {
                width: albumArtWidth,
                height: albumArtWidth,
                maxWidth: height / 2,
                maxHeight: height / 2,
                display: height < 600 ? 'none' : 'flex',
              },
            ]}
            source={{ uri: songInfo.imageSrc }}
          />
        )}
        <View
          style={[
            styles.titleAndControlsContainer,
            height < 600 && styles.titleAndControlsContainerLandscape,
          ]}
        >
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} style={styles.title}>
              {songInfo.title}
            </Text>
            <Text numberOfLines={1} variant='bodyLarge' style={styles.artist}>
              {songInfo.artist}
            </Text>
          </View>
          <PlayerControls songInfo={songInfo} />
          <PlayerExtraActions />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Player;
