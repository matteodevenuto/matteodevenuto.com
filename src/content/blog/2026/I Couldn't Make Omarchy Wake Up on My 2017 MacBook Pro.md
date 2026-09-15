---
title: "I Couldn't Make Omarchy Wake Up on My 2017 MacBook Pro"
pubDatetime: 2026-09-15T09:00:00.000+02:00
draft: false
heroImage: /assets/img/2026/i-couldnt-make-omarchy-wake-up-on-my-2017-macbook-pro/header.jpg
description: "Deep sleep exposed Radeon, Thunderbolt, and USB resume failures. The usable workaround was not real sleep."
tags:
  - Linux
  - Omarchy
  - Debugging
  - Hardware
  - Power Management
---

I installed Omarchy on a 2017 15-inch MacBook Pro and discovered that closing the lid could make the machine unusable. It entered suspend, but the screen stayed black when I opened it. Each failed attempt ended with a forced restart.

The final workaround was `s2idle`. It preserved my session and resumed, but the fans could keep running. That made it useful at a desk, not safe in a bag. The interesting part was learning why the stronger claim, “the Radeon breaks sleep,” went beyond the evidence.

## The failure was below the desktop

This MacBookPro14,3 has two graphics processors: Intel HD Graphics 630 and an AMD Radeon Pro 560. [Apple’s specifications for the 15-inch 2017 model](https://support.apple.com/en-ie/111947) confirm that graphics combination. The machine also has Apple’s T1 chip, Thunderbolt controllers, and a Samsung NVMe drive. That combination matters because suspend asks every device to enter and leave a lower power state correctly.

The first deep sleep test entered the S3 power state:

```text
systemd-sleep: Performing sleep operation 'suspend'...
kernel: PM: suspend entry (deep)
```

That boot never recorded `PM: suspend exit`. The next record was a new boot after I forced the machine off.

Later attempts resumed far enough to leave better evidence:

```text
amdgpu: SMU load firmware failed
amdgpu: smu firmware loading failed
amdgpu 0000:01:00.0: amdgpu_device_ip_resume failed (-22)
thunderbolt: Unable to change power state from D3cold to D0
xhci_hcd: PCI post-resume error -19
```

The Radeon clearly failed to restore its power-management firmware. Calling it the sole cause would still be inaccurate. Thunderbolt and USB host controllers failed during the same investigation, including one attempt without a recorded AMD error. The evidence pointed to a wider PCI resume problem.

## One workaround targeted the wrong device

The most useful discovery was not a kernel parameter. It was a false assumption about PCI addresses.

Omarchy’s [`fix-suspend-nvme.sh` installer script](https://github.com/omacom/omarchy/blob/quattro/install/hardware/apple/fix-suspend-nvme.sh) hard-coded `01:00.0` as the NVMe controller for every supported MacBook. That address is correct on models such as the `MacBookPro13,1`, but PCI addresses are not portable hardware identities. On this Mac, `01:00.0` was the Radeon and the Samsung NVMe controller was at `02:00.0`. A separate [MacBookPro14,3 hardware project](https://github.com/gavinmclelland/omarchy-macbookpro14-3) records the same `02:00.0` NVMe address.

I corrected the service to target the actual NVMe controller:

```ini
ExecStart=/bin/sh -c 'echo 0 > /sys/bus/pci/devices/0000:02:00.0/d3cold_allowed'
```

Deep sleep still failed. The address error was real, but it was not the root cause. This distinction matters in debugging: finding one incorrect configuration does not prove that fixing it solves the reported failure.

## Each experiment narrowed the diagnosis

I changed one part of the suspend path at a time and checked the journal after each attempt.

| Experiment | Result | What it established |
| --- | --- | --- |
| Select `s2idle` in systemd | The first attempt still required a restart | Avoiding S3 alone was not sufficient in that configuration |
| Hibernate on lid close | No usable hibernation image; the next boot reported `PM: Image not found (code -22)` | Hibernation was not a safe fallback |
| Restart `systemd-logind` after changing the lid rule | The active graphical session went black | Restarting logind introduced a separate failure and invalidated that test |
| Correct the NVMe PCI address | Deep sleep still failed | The bad device target was not the complete explanation |
| Set `pm_async=0` | Results varied; one test logged an xHCI suspend error `-16` | Serial device suspension did not make S3 reliable |
| Use `pm_test=devices` | Some failures occurred before the firmware sleep transition | At least part of the problem lived in device suspension |
| Add `pcie_ports=compat` | AMD, Thunderbolt, and xHCI errors remained | PCIe compatibility mode did not repair resume |
| Persist `mem_sleep_default=s2idle` | Later tests entered and exited suspend successfully | Light idle was a workable compromise |

The table also records failed ideas. That is intentional. Without it, a future test could repeat a change that already failed or mistake a coincidental successful resume for a fix.

## The workaround was not a fix

Linux exposes `s2idle` and `deep` on this machine. The [Linux kernel sleep-state documentation](https://docs.kernel.org/admin-guide/pm/sleep-states.html) defines `deep` as suspend-to-RAM, which maps to ACPI S3, and `s2idle` as a software-based, lighter suspend state. Deep sleep powers down more hardware but could not restore it reliably on this Mac. `s2idle` kept more of the system active, so resume had less work to do.

I made `s2idle` persistent in both systemd and the kernel command line:

```ini
[Sleep]
MemorySleepMode=s2idle
```

```text
pcie_ports=compat mem_sleep_default=s2idle
```

Later lid-close tests resumed successfully. The remaining cost was visible: the fans could continue running, showing that the laptop had not reached the low-power behavior I expected from S3. My operating rule became straightforward: use `s2idle` to preserve a session at a desk, and shut the laptop down before storing or transporting it.

I also investigated forcing Intel-only graphics with `apple-gmux force_igd=y` and blacklisting `amdgpu`. I did not test it. A mistake could leave the internal display unusable, and losing the Radeon was a larger tradeoff than I wanted for this machine.

## A bounded conclusion is still useful

I did not repair deep sleep, and the logs do not support a single-device diagnosis. They do support four narrower conclusions:

- Deep S3 was unreliable on this hardware and kernel configuration
- The Radeon failed during resume, but Thunderbolt and xHCI failed too
- Correcting a genuine PCI-address mistake did not solve the broader problem
- Persistent `s2idle` made resume usable, but the fans could keep running
