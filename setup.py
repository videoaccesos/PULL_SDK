#!/usr/bin/env python

from setuptools import setup, find_packages

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name='pyzkaccess',
    description='Library and CLI tool '
                'for working with ZKTeco ZKAccess C3-100/200/400 controllers',
    version='1.1',
    author='Igor Derkach',
    author_email='gosha753951@gmail.com',
    url='https://github.com/bdragon300/pyzkaccess',
    license='Apache 2.0',
    python_requires='>=3.8',
    packages=find_packages(exclude=['tests', 'docs']),
    long_description=long_description,
    long_description_content_type='text/markdown',
    entry_points={"console_scripts": ["pyzkaccess=pyzkaccess.cli:main"]},
    classifiers=[
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Operating System :: Microsoft :: Windows',
        'Development Status :: 5 - Production/Stable',
        'License :: OSI Approved :: Apache Software License',
        'Intended Audience :: Developers',
        'Intended Audience :: Telecommunications Industry',
        'Intended Audience :: Customer Service',
        'Topic :: System :: Hardware'
    ],
    install_requires=[
        'wrapt',
        'fire',
        'prettytable'
    ],
)
