// +build !sgx_enclave

package cmd

import (
	"nulink/core/logger"
)

// InitEnclave is a stub in non SGX enabled builds.
func InitEnclave() error {
	logger.Infow("SGX enclave *NOT* loaded")
	logger.Infow("This version of nulink was not built with support for SGX tasks")
	return nil
}
