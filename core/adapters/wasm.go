// +build !sgx_enclave

package adapters

import (
	"fmt"

	"nulink/core/store"
	"nulink/core/store/models"
)

// Wasm represents a wasm binary encoded as base64 or wasm encoded as text (a lisp like language).
type Wasm struct {
	WasmT string `json:"wasmt"`
}

// Perform ships the wasm representation to the SGX enclave where it is evaluated.
func (wasm *Wasm) Perform(input models.RunInput, _ *store.Store) models.RunOutput {
	err := fmt.Errorf("Wasm is not supported without SGX")
	return models.NewRunOutputError(err)
}
