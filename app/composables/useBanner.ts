export const useBanner = () => {
  const isBannerVisible = useState<boolean>('isBannerVisible', () => true)

  const hideBanner = () => {
    isBannerVisible.value = false
  }

  return {
    isBannerVisible,
    hideBanner
  }
}
