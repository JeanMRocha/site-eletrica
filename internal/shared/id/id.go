package id

import (
	"crypto/rand"
	"math/big"
)

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

func Base62(n int) string {
	if n <= 0 {
		return ""
	}

	buf := make([]byte, n)
	max := big.NewInt(int64(len(alphabet)))
	for i := range buf {
		v, err := rand.Int(rand.Reader, max)
		if err != nil {
			panic("shared/id: failed to generate random id")
		}
		buf[i] = alphabet[v.Int64()]
	}

	return string(buf)
}
