# packages/python-sdk/setup.py
"""
Setup configuration for DDEX Workbench Python SDK
"""

import os
import sys
from pathlib import Path
from setuptools import setup, find_packages

# Get the long description from README
here = Path(__file__).parent.resolve()
long_description = (here / "README.md").read_text(encoding="utf-8")

# Get version from __init__.py
version_file = here / "ddex_workbench" / "__init__.py"
version = "1.0.1"
for line in version_file.read_text().splitlines():
    if line.startswith("__version__"):
        version = line.split('"')[1]
        break

setup(
    name="ddex-workbench",
    version=version,
    author="DDEX Workbench Contributors",
    author_email="support@ddex-workbench.org",
    description="Official Python SDK for DDEX Workbench - Open-source DDEX validation and processing tools",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/daddykev/ddex-workbench",
    project_urls={
        "Bug Reports": "https://github.com/daddykev/ddex-workbench/issues",
        "Documentation": "https://ddex-workbench.org/docs",
        "Source": "https://github.com/daddykev/ddex-workbench/tree/main/packages/python-sdk",
        "Homepage": "https://ddex-workbench.org",
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Multimedia :: Sound/Audio",
        "Topic :: Text Processing :: Markup :: XML",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy",
        "Typing :: Typed",
    ],
    keywords="ddex ern music metadata validation xml music-industry digital-distribution",
    packages=find_packages(exclude=["tests", "tests.*", "examples", "examples.*"]),
    python_requires=">=3.7",
    install_requires=[
        "requests>=2.28.0",
        "urllib3>=1.26.0",
        'typing-extensions>=4.0.0;python_version<"3.8"',
        'dataclasses>=0.6;python_version<"3.7"',
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "pytest-mock>=3.10.0",
            "pytest-asyncio>=0.21.0",
            "responses>=0.22.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
            "flake8>=6.0.0",
            "isort>=5.12.0",
            "tox>=4.0.0",
            "twine>=4.0.0",
            "wheel>=0.38.0",
            "build>=0.10.0",
        ],
        "docs": [
            "sphinx>=5.0.0",
            "sphinx-rtd-theme>=1.2.0",
            "sphinx-autodoc-typehints>=1.22.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "ddex-validate=ddex_workbench.cli:main",
        ],
    },
    package_data={
        "ddex_workbench": ["py.typed"],
    },
    include_package_data=True,
    zip_safe=False,
)