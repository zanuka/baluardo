import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EmptyState from '@/components/EmptyState.vue'

describe('EmptyState', () => {
  it('renders the title', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No detections in queue',
        description: 'Queue is clear.',
      },
    })

    expect(wrapper.text()).toContain('No detections in queue')
    expect(wrapper.text()).toContain('Queue is clear.')
  })
})
