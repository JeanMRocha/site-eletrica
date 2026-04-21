package standards

type StandardStatus string

const (
	StandardStatusActive  StandardStatus = "active"
	StandardStatusDraft   StandardStatus = "draft"
	StandardStatusRetired StandardStatus = "retired"
)

type SourceType string

const (
	SourceTypeConstitution  SourceType = "constitution"
	SourceTypeLaw           SourceType = "law"
	SourceTypeDecree        SourceType = "decree"
	SourceTypeRegulation    SourceType = "regulation"
	SourceTypeConcessionary SourceType = "concessionary"
	SourceTypeNormative     SourceType = "normative"
	SourceTypeInternal      SourceType = "internal"
)

type HierarchyLevel struct {
	ID     string `json:"id"`
	Weight int    `json:"weight"`
}

type NormRule struct {
	RuleID          string     `json:"ruleId"`
	OriginType      SourceType `json:"originType"`
	OriginName      string     `json:"originName"`
	HierarchyWeight int        `json:"hierarchyWeight"`
	ConflictType    string     `json:"conflictType,omitempty"`
	LocalPriority   int        `json:"localPriority,omitempty"`
	StandardCode    string     `json:"standardCode,omitempty"`
	Notes           []string   `json:"notes,omitempty"`
}

type Standard struct {
	Code            string         `json:"code"`
	Title           string         `json:"title"`
	Domain          string         `json:"domain"`
	Subject         string         `json:"subject"`
	Version         string         `json:"version"`
	Status          StandardStatus `json:"status"`
	SourceType      SourceType     `json:"sourceType"`
	SourceName      string         `json:"sourceName,omitempty"`
	HierarchyWeight int            `json:"hierarchyWeight"`
	AppliesTo       []string       `json:"appliesTo,omitempty"`
	Notes           []string       `json:"notes,omitempty"`
}

type Catalog struct {
	Standards []Standard `json:"standards"`
}
