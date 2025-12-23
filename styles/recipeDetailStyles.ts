import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 260;

export { IMAGE_HEIGHT, SCREEN_WIDTH };

export const recipeDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  // Progress Bar
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 4,
    zIndex: 100,
  },
  // Skeleton
  skeletonContainer: {
    flex: 1,
  },
  skeletonImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: "#E0E0E0",
  },
  skeletonBody: {
    padding: 20,
  },
  skeletonTitle: {
    height: 32,
    width: "70%",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonDescription: {
    height: 48,
    width: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 20,
  },
  skeletonMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  skeletonMetaItem: {
    width: 70,
    height: 70,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
  },
  skeletonSection: {
    height: 120,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 16,
  },
  shimmer: {
    opacity: 0.7,
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 16,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backLink: {
    padding: 10,
  },
  backLinkText: {
    color: "#FF6B00",
    fontSize: 14,
  },
  // Image
  imageContainer: {
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  floatingButtons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingBtnText: {
    fontSize: 20,
  },
  // Body
  body: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  // Progress Section
  progressSection: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  // Meta Row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  metaItem: {
    alignItems: "center",
    flex: 1,
  },
  metaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  servingsBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  servingsText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },
  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  cookingModeHint: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  // Ingredients
  ingredientsList: {
    borderRadius: 16,
    padding: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  ingredientCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  ingredientCheckboxChecked: {
    backgroundColor: "#FF6B00",
  },
  ingredientCheckmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  ingredientChecked: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  ingredientAmount: {
    fontSize: 13,
  },
  ingredientHint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  // Tip Box
  tipBox: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FFB300",
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  fabText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  modalDishName: {
    fontWeight: "700",
    color: "#FF6B00",
    fontSize: 18,
  },
  modalSubtext: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
