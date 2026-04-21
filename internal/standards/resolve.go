package standards

func NormalizeRule(rule NormRule) NormRule {
	if rule.HierarchyWeight == 0 {
		rule.HierarchyWeight = WeightForSourceType(rule.OriginType)
	}

	return rule
}
