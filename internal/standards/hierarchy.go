package standards

var DefaultHierarchy = []HierarchyLevel{
	{ID: "constitution", Weight: 100},
	{ID: "law", Weight: 90},
	{ID: "decree", Weight: 80},
	{ID: "nr", Weight: 70},
	{ID: "concessionary", Weight: 60},
	{ID: "normative", Weight: 50},
	{ID: "internal", Weight: 10},
}

func WeightForSourceType(source SourceType) int {
	switch source {
	case SourceTypeConstitution:
		return 100
	case SourceTypeLaw:
		return 90
	case SourceTypeDecree:
		return 80
	case SourceTypeRegulation:
		return 70
	case SourceTypeConcessionary:
		return 60
	case SourceTypeNormative:
		return 50
	case SourceTypeInternal:
		return 10
	default:
		return 0
	}
}

func ResolveByHierarchy(a, b NormRule) NormRule {
	if a.LocalPriority != b.LocalPriority {
		if a.LocalPriority > b.LocalPriority {
			return a
		}

		return b
	}

	if a.HierarchyWeight != b.HierarchyWeight {
		if a.HierarchyWeight > b.HierarchyWeight {
			return a
		}

		return b
	}

	return a
}
