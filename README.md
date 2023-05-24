<!-- README Template from: https://github.com/othneildrew/Best-README-Template -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/arroyodev-llc/components">
    <img src=".github/images/logo.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Components</h3>

  <p align="center">
    Central repository for reusuable generic components!
    <br />
    <a href="https://github.com/arroyodev-llc/components"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/arroyodev-llc/components">View Demo</a>
    ·
    <a href="https://github.com/arroyodev-llc/components/issues">Report Bug</a>
    ·
    <a href="https://github.com/arroyodev-llc/components/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Central repository for reusuable components.

### Built With

- [projen](https://github.com/projen/projen)
- [nx](https://github.com/nrwl/nx)
- [pnpm](https://github.com/pnpm/pnpm)

## Getting Started

Follow these steps to run the project locally:

### Prerequisites

#### RTX

_Note: You can also use [`asdf`](https://github.com/asdf-vm/asdf) if you already have it installed and working_

- Install [rtx](https://github.com/jdxcode/rtx) (asdf clone in rust).

- Follow instructions on hooking rtx into your shell [here](https://github.com/jdxcode/rtx#quickstart)

- After installing `rtx`, add all the plugins found in the [.tool-versions](.tool-versions) file.

  ```bash
  # Add all the plugins.
  cat .tool-versions | awk '{print $1}' | xargs -I _ rtx plugin add _

  # Install all according to .tool-versions.
  rtx install
  ```

- You should now have all the tools required (defined in [.tool-versions](.tool-versions)) to run this project.

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Clone the repo
   ```sh
   gh repo clone ArroyoDev-LLC/components
   ```
2. cd into repo
   ```sh
   cd components
   ```
3. Install packages
   ```sh
   pnpm install
   ```

## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

See [`LICENSE`](LICENSE) for more information.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/arroyodev-llc/components.svg?style=for-the-badge
[contributors-url]: https://github.com/arroyodev-llc/components/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/arroyodev-llc/components.svg?style=for-the-badge
[forks-url]: https://github.com/arroyodev-llc/components/network/members
[stars-shield]: https://img.shields.io/github/stars/arroyodev-llc/components.svg?style=for-the-badge
[stars-url]: https://github.com/arroyodev-llc/components/stargazers
[issues-shield]: https://img.shields.io/github/issues/arroyodev-llc/components.svg?style=for-the-badge
[issues-url]: https://github.com/arroyodev-llc/components/issues
[license-shield]: https://img.shields.io/github/license/arroyodev-llc/components.svg?style=for-the-badge
[license-url]: https://github.com/arroyodev-llc/components/blob/main/LICENSE
