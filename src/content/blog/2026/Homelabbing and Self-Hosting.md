---
title: "Homelabbing and Self-Hosting"
pubDatetime: 2026-03-06T16:00:00.000+01:00
description: "Repurposing a Mac Mini into a secure, private homelab: Jellyfin streaming, Tailscale access, Pi-hole ad-blocking, and the joys of self-hosting without exposing anything to the internet."
heroImage: /assets/img/2026/homelabbing-and-self-hosting/header.jpg
tags:
- Homelab
- Self-Hosting
- Privacy
- Open Source
- Jellyfin
- Tailscale
- Pi-hole
- Raspberry Pi

- Self-hosting
- Ad Blocking
- Network-wide Ad Blocking
---

Last summer, well before the whole [OpenClaw](https://openclaw.ai/) frenzy exploded and sent everyone scrambling for Mac Minis, I picked up a base-model [M4 Mac Mini](https://www.apple.com/mac-mini/specs/). My main goal was simple: run the iOS Simulator (which I couldn't do on Linux) and use it to work on the iOS version of my mobile position size calculator app, [Forexizer](https://forexizer.app).

At home, my main desktop already handles everything else, running [Omarchy](https://omarchy.org/) (I’ll write a full post about that setup eventually). That left the Mac Mini gathering dust most of the time. Instead of letting it sit idle, I decided to turn it into the starting point for my homelab adventure.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Trying out Omarchy ! <a href="https://twitter.com/dhh?ref_src=twsrc%5Etfw">@dhh</a> <a href="https://t.co/4R6tjT5OMB">pic.twitter.com/4R6tjT5OMB</a></p>&mdash; Matteo De Venuto (@matteodevenuto) <a href="https://twitter.com/matteodevenuto/status/1966878941525766567?ref_src=twsrc%5Etfw">September 13, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I’ve been into open-source software and privacy-focused tools for years. Self-hosting felt like the natural next step, especially since I love tinkering with computers.


<img src="/assets/img/2026/homelabbing-and-self-hosting/jellyfin.png">

I kicked things off with a media server using [Jellyfin](https://jellyfin.org/), which I’ve been running for a while now. Honestly, it’s absolutely fantastic. The interface is clean, playback is reliable across devices.

Over time, I experimented with different setups: various reverse proxies, domain configurations, the usual self-hosting rabbit hole. But I never loved the idea of exposing everything directly to the open internet. Security concerns always nagged at me.

<img src="/assets/img/2026/homelabbing-and-self-hosting/tailscale.png">

Recently, I integrated [Tailscale](https://tailscale.com/), and it's a game-changer. It instantly made everything more secure without complicated port forwarding or firewall gymnastics. Now I can access my Jellyfin library (and everything else) from anywhere, on any device, with zero exposure to the public web. The experience feels seamless and private, which is exactly what I wanted.

<img src="/assets/img/2026/homelabbing-and-self-hosting/raspberry-pi-2w.png">

My next addition was a Raspberry Pi running [Pi-hole](https://pi-hole.net/). I had a [Raspberry Pi Zero 2 W](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w) laying around, so I set it up to block ads and telemetry network-wide. The installation was surprisingly straightforward, just a one-liner curl command on fresh [Raspberry Pi OS](https://www.raspberrypi.com/software/operating-systems/) and within minutes, I had it acting as my DNS sinkhole. Pointing my router's DNS to the Pi's static IP was the only real config step, and boom: cleaner browsing across every device in the house, from phones and laptops to smart TVs, without installing a single browser extension. The difference is immediately noticeable, pages load faster, no more creepy trackers phoning home, and I’ve already blocked millions of queries according to the web dashboard. It pairs perfectly with Tailscale too, letting me enjoy the same ad-free experience even when I’m away from home. For something so lightweight and low-power, it’s become one of the highest-impact pieces of my homelab.

<img src="/assets/img/2026/homelabbing-and-self-hosting/pi-hole.png">

This Mac Mini experiment has been a lot of fun so far, and it’s only the beginning. I’m already eyeing more services to add and if you’re on the fence about turning an old/new Mac into a homelab server, I’d say go for it. Especially with tools like Tailscale, the security side is way easier than it used to be, tinkering is always fun, and you definitely will learn something.
