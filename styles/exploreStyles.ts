import { StyleSheet } from "react-native";

export const exploreStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  // Search
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: "500",
  },
  searchBtn: {
    paddingHorizontal: 24,
    borderRadius: 16,
    justifyContent: "center",
  },
  searchBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  // Hero Section
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
  },
  heroEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
  },
  // Tag Section
  tagSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  tagsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  // Modern Tag
  modernTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1.5,
    gap: 8,
  },
  tagIcon: {
    fontSize: 18,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tagCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  tagCheckText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Selected Tags Bar
  selectedBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  selectedTagsScroll: {
    flex: 1,
    gap: 8,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  selectedTagIcon: {
    fontSize: 14,
  },
  selectedTagText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },
  removeTagBtn: {
    marginLeft: 4,
  },
  removeTagText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 12,
  },
  clearAllBtn: {
    padding: 6,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: "500",
  },
  searchSelectedBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  searchSelectedText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  // Categories
  categoriesScroll: {
    flex: 1,
  },
  categoriesContent: {
    paddingTop: 8,
  },
  // Results
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  clearLink: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
  },
  retryBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  // Skeleton
  skeletonContainer: {
    paddingHorizontal: 20,
  },
  skeletonCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  skeletonText: {
    height: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  // Tips
  tipsContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
